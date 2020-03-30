

import { GraphRbacManagementClient } from '@azure/graph'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { ResourceManagementClient } from '@azure/arm-resources'
import { WebSiteManagementClient } from '@azure/arm-appservice-profile-2019-03-01-hybrid'
import { ResourceGroup, Deployment, ResourceGroupsCreateOrUpdateResponse, DeploymentsValidateResponse, DeploymentsCreateOrUpdateResponse } from '@azure/arm-resources/esm/models';
import * as util from 'util'
import * as rp from 'request-promise'
import archiver = require('archiver')
const exec = util.promisify(require('child_process').exec)
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

export class BotProjectDeploy {

    private subId: string
    private projFolder: string
    private creds: any

    private readonly tenantId = '72f988bf-86f1-41af-91ab-2d7cd011db47'

    public constructor(suscriptionId: string, projFolder: string) {
        this.subId = suscriptionId
        this.projFolder = projFolder
    }

    private pack(scope: any) {
        return {
            value: scope
        }
    }

    private getDeploymentTemplateParam(appId: string, appPwd: string, location: string, name: string, shouldCreateAuthoringResource: boolean, luisAuthoringKey: string) {
        return {
            appId: this.pack(appId),
            appSecret: this.pack(appPwd),
            appServicePlanLocation: this.pack(location),
            botId: this.pack(name),
            shouldCreateAuthoringResource: this.pack(shouldCreateAuthoringResource)
        }
    }

    private async readTemplateFile(templatePath?: string): Promise<any> {
        if (!templatePath) {
            templatePath = path.join('DeploymentTemplates', 'template-with-preexisting-rg.json')
        }

        return new Promise((resolve, reject) => {
            fs.readFile(templatePath, { encoding: 'utf-8' }, (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }

    private async createResourceGroup(client: ResourceManagementClient, location: string, resourceGroupName: string): Promise<ResourceGroupsCreateOrUpdateResponse> {
        console.log(`> Creating resource group ...`)
        const param = {
            location: location
        } as ResourceGroup

        return await client.resourceGroups.createOrUpdate(resourceGroupName, param)
    }

    private async validateDeployment(client: ResourceManagementClient, templatePath: string, location: string, resourceGroupName: string, deployName: string, templateParam: any): Promise<DeploymentsValidateResponse> {
        console.log('> Validating Azure deployment ...')
        const templateFile = await this.readTemplateFile(templatePath)
        const deployParam = {
            properties: {
                template: JSON.parse(templateFile),
                parameters: templateParam,
                mode: 'Incremental'
            }
        } as Deployment
        return await client.deployments.validate(resourceGroupName, deployName, deployParam)
    }

    private async createDeployment(client: ResourceManagementClient, templatePath: string, location: string, resourceGroupName: string, deployName: string, templateParam: any): Promise<DeploymentsCreateOrUpdateResponse> {
        console.log(`> Deploying Azure services (this could take a while)...`)
        const templateFile = await this.readTemplateFile(templatePath)
        const deployParam = {
            properties: {
                template: JSON.parse(templateFile),
                parameters: templateParam,
                mode: 'Incremental'
            }
        } as Deployment

        return await client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam)
    }

    private async createApp(graphClient: GraphRbacManagementClient, displayName: string, appPassword: string) {
        const createRes = await graphClient.applications.create({
            displayName: displayName,
            passwordCredentials: [{
                value: appPassword,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
            }],
            availableToOtherTenants: true,
            replyUrls: [
                'https://token.botframework.com/.auth/web/redirect'
            ]
        })
        return createRes
    }

    private unpackObject(output: any) {
        let unpakced: any = {}
        for (const key in output) {
            const objValue = output[key]
            if (objValue.value) {
                unpakced[key] = objValue.value
            }
        }
        return unpakced
    }

    private async updateDeploymentJsonFile(settingsPath: string, client: ResourceManagementClient, resourceGroupName: string, deployName: string, appId: string, appPwd: string): Promise<any> {
        const outputs = await client.deployments.get(resourceGroupName, deployName)
        return new Promise((resolve, reject) => {
            if (outputs.properties.outputs) {
                const outputResult = outputs.properties.outputs
                const applicatoinResult = {
                    MicrosoftAppId: appId,
                    MicrosoftAppPassword: appPwd
                }
                const outputObj = this.unpackObject(outputResult)

                let result = {}
                Object.assign(result, outputObj, applicatoinResult)

                fs.writeFile(settingsPath, JSON.stringify(result, null, 4), (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            }
            else {
                resolve({})
            }
        })
    }

    private async writeToLog(data: any, logFile: string) {
        return new Promise((resolve, reject) => {
            fs.writeFile(logFile, JSON.stringify(data, null, 4), (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    }

    private async getFiles(dir: string): Promise<string[]> {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    private async botPrepareDeploy(pathToDeploymentFile: string) {
        return new Promise((resolve, reject) => {
            const data = `[config]\nproject = BotProject.csproj`
            fs.writeFile(pathToDeploymentFile, data, (err) => {
                reject(err)
            })
        })
    }

    private async dotnetPublish(publishFolder: string, projFolder: string, botPath?: string) {
        const projectPath = path.join(projFolder, 'BotProject.csproj')
        await exec(`dotnet publish ${projectPath} -c release -o ${publishFolder} -v q`)
        return new Promise((resolve, reject) => {
            const remoteBotPath = path.join(publishFolder, 'ComposerDialogs')
            const localBotPath = path.join(projFolder, 'ComposerDialogs')

            if (botPath) {
                console.log(`Publishing dialogs from external bot project: ${botPath}`)
                fs.copy(botPath, remoteBotPath, {
                    overwrite: true,
                    recursive: true
                }, (err) => {
                    reject(err)
                })
            }
            else {
                fs.copy(localBotPath, remoteBotPath, {
                    overwrite: true,
                    recursive: true
                }, (err) => {
                    reject(err)
                })
            }
            resolve()
        })
    }

    private async zipDirectory(source: string, out: string) {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = fs.createWriteStream(out);

        return new Promise((resolve, reject) => {
            archive
                .directory(source, false)
                .on('error', err => reject(err))
                .pipe(stream)
                ;

            stream.on('close', () => resolve());
            archive.finalize();
        });
    }

    private notEmptyLuisModel(file: string) {
        return fs.readFileSync(file).length > 0
    }

    public async deploy(name: string, environment: string, luisAuthoringKey?: string, luisAuthoringRegion?: string, logFile?: string, botPath?: string, language?: string) {
        if (!logFile) {
            logFile = 'deploy_log.txt'
        }
        if (!this.creds) {
            this.creds = await msRestNodeAuth.interactiveLogin()
        }
        const resourceClient = new ResourceManagementClient(this.creds, this.subId)
        const webClient = new WebSiteManagementClient(this.creds, this.subId)

        const resourceGroup = `${name}-${environment}`

        // Check for existing deployment files
        const deployFilePath = path.join(this.projFolder, '.deployment')
        if (!await fs.pathExists(deployFilePath)) {
            await this.botPrepareDeploy(deployFilePath)
        }

        const zipPath = path.join(this.projFolder, 'code1.zip')
        if (await fs.pathExists(zipPath)) {
            await fs.remove(zipPath)
        }

        // dotnet publish
        const publishFolder = path.join(this.projFolder, 'bin\\Release\\netcoreapp3.1')
        await this.dotnetPublish(publishFolder, this.projFolder, botPath)
        const settingsPath = path.join(this.projFolder, 'appsettings.deployment.json')
        const settings = await fs.readJSON(settingsPath)
        const luisSettings = settings.luis

        let luisEndpointKey: string

        if (!luisAuthoringKey) {
            luisAuthoringKey = luisSettings.authoringKey
            luisEndpointKey = luisSettings.endpointKey
        }

        if (!luisAuthoringRegion) {
            luisAuthoringRegion = luisSettings.region
        }

        if (!language) {
            language = 'en-us'
        }

        if (luisAuthoringKey && luisAuthoringRegion) {
            // publishing luis
            const remoteBotPath = path.join(publishFolder, 'ComposerDialogs')
            const botFiles = await this.getFiles(remoteBotPath)
            const modelFiles = botFiles.filter((name) => {
                return name.endsWith('.lu') && this.notEmptyLuisModel(name)
            })

            const generatedFolder = path.join(remoteBotPath, 'generated')
            if (!await fs.pathExists(generatedFolder)) {
                await fs.mkdir(generatedFolder)
            }
            let builder = new luBuild.Builder(msg => console.log(msg))

            const loadResult = await builder.loadContents(modelFiles,
                language || '',
                environment || '',
                luisAuthoringRegion || '')

            const buildResult = await builder.build(
                loadResult.luContents,
                loadResult.recognizers,
                luisAuthoringKey,
                luisAuthoringRegion,
                name,
                environment,
                language,
                false,
                loadResult.multiRecognizers,
                loadResult.settings)
            await builder.writeDialogAssets(buildResult, true, generatedFolder)

            console.log(`lubuild succeed`)

            const luisConfigFiles = (await this.getFiles(remoteBotPath)).filter(filename => filename.includes('luis.settings'))
            let luisAppIds: any = {}

            for (let luisConfigFile of luisConfigFiles) {
                const luisSettings = await fs.readJson(luisConfigFile)
                Object.assign(luisAppIds, luisSettings.luis)
            }

            const luisEndpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`
            let luisConfig: any = {
                endpoint: luisEndpoint,
                endpointKey: luisEndpointKey
            }

            Object.assign(luisConfig, luisAppIds)

            const deploymentSettingsPath = path.join(publishFolder, 'appsettings.deployment.json')
            let settings: any = await fs.readJson(deploymentSettingsPath)
            settings['luis'] = luisConfig

            await fs.writeJson(deploymentSettingsPath, settings)
            const token = await this.creds.getToken()

            const getAccountUri = `${luisEndpoint}/luis/api/v2.0/azureaccounts`
            const options = {
                headers: { "Authorization": `Bearer ${token.accessToken}`, "Ocp-Apim-Subscription-Key": luisAuthoringKey },
            } as rp.RequestPromiseOptions;
            const response = await rp.get(getAccountUri, options)
            const jsonRes = JSON.parse(response)
            const account = this.getAccount(jsonRes, `${name}-${environment}-luis`)

            for (let k in luisAppIds) {
                const luisAppId = luisAppIds[k]
                console.log(`Assigning to luis app id: ${luisAppIds}`)
                const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`
                const options = {
                    body: account,
                    json: true,
                    headers: { "Authorization": `Bearer ${token.accessToken}`, "Ocp-Apim-Subscription-Key": luisAuthoringKey },
                } as rp.RequestPromiseOptions;
                const response = await rp.post(luisAssignEndpoint, options)
                console.log(response)
            }
            console.log('Luis Publish Success! ...')
        }
        console.log('Packing up the bot service ...')
        await this.zipDirectory(publishFolder, zipPath)
        console.log('Packing Service Success!')

        console.log('Publishing to Azure ...')
        await this.deployZip(webClient, zipPath, name, environment, this.creds, this.subId)
        console.log('Publish To Azure Success!')
    }

    private getAccount(accounts: any, filter: string) {
        for (let account of accounts) {
            if (account.AccountName === filter) {
                return account
            }
        }
    }

    private async deployZip(webSiteClient: WebSiteManagementClient, zipPath: string, name: string, env: string, creds, subId: string) {

        console.log('Retrieve publishing details ...')
        const userName = `${name}-${env}`
        const userPwd = `${name}-${env}-${new Date().getTime().toString()}`

        const updateRes = await webSiteClient.updatePublishingUser({
            publishingUserName: userName,
            publishingPassword: userPwd
        })

        const publishEndpoint = `https://${name}-${env}.scm.azurewebsites.net/zipdeploy`

        const publishCreds = Buffer.from(`${userName}:${userPwd}`).toString('base64')

        const fileContent = await fs.readFile(zipPath)
        const options = {
            body: fileContent,
            encoding: null,
            headers: {
                'Authorization': `Basic ${publishCreds}`,
                'Content-Type': 'application/zip',
                'Content-Length': fileContent.length
            },
        } as rp.RequestPromiseOptions
        const response = await rp.post(publishEndpoint, options)
        console.log(response)
    }

    public async create(name: string, location: string, environment: string, luisAuthoringKey?: string, appId?: string, appPassword?: string) {
        if (!this.creds) {
            this.creds = await msRestNodeAuth.interactiveLogin()
        }
        const credsForGraph = new msRestNodeAuth.DeviceTokenCredentials(this.creds.clientId, this.tenantId, this.creds.username, 'graph', this.creds.environment, this.creds.tokenCache)
        const graphClient = new GraphRbacManagementClient(credsForGraph, this.tenantId, {
            baseUri: "https://graph.windows.net"
        });
        const logFile = path.join('create_log.txt')

        const deploymentSettingsPath = path.join(this.projFolder, 'appsettings.deployment.json')
        if (!fs.existsSync(deploymentSettingsPath)) {
            console.log(`! Could not find an 'appsettings.deployment.json' file in the current directory.`)
            return
        }

        const settings = await fs.readJson(deploymentSettingsPath)
        appId = settings.MicrosoftAppId

        if (!appId) {
            if (!appPassword) {
                console.error(`App password is required`)
                return
            }
            console.log('> Creating App Registration ...')
            const appCreated = await this.createApp(graphClient, name, appPassword)
            await this.writeToLog(appCreated, logFile)
            appId = appCreated.appId
            console.log(`> Create App Id Success! ID: ${appId}`)
        }

        var shouldCreateAuthoringResource = true
        if (luisAuthoringKey) {
            shouldCreateAuthoringResource = false
        }

        const resourceGroupName = `${name}-${environment}`

        // timestamp will be used as deployment name
        const timeStamp = new Date().getTime().toString()
        const client = new ResourceManagementClient(this.creds, this.subId);

        const rpres = await this.createResourceGroup(client, location, resourceGroupName)
        await this.writeToLog(rpres, logFile)

        const deploymentTemplateParam = this.getDeploymentTemplateParam(appId, appPassword, location, name, shouldCreateAuthoringResource, luisAuthoringKey)
        await this.writeToLog(deploymentTemplateParam, logFile)

        const templatePath = path.join(this.projFolder, 'DeploymentTemplates', 'template-with-preexisting-rg.json')

        const validation = await this.validateDeployment(client, templatePath, location, resourceGroupName, timeStamp, deploymentTemplateParam)
        await this.writeToLog(validation, logFile)

        if (validation.error) {
            console.error(`! Template is not valid with provided parameters. Review the log for more information.`)
            console.error(`! Error: ${validation.error.message}`)
            console.error(`! Log: ${logFile}`)
            console.error(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`)
            return false
        }

        const deployment = await this.createDeployment(client, templatePath, location, resourceGroupName, timeStamp, deploymentTemplateParam)
        await this.writeToLog(deployment, logFile)
        if (deployment._response.status != 200) {
            console.error(`! Template is not valid with provided parameters. Review the log for more information.`)
            console.error(`! Error: ${validation.error.message}`)
            console.error(`! Log: ${logFile}`)
            console.error(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`)
            return false
        }

        const updateResult = await this.updateDeploymentJsonFile(deploymentSettingsPath, client, resourceGroupName, timeStamp, appId, appPassword)
        await this.writeToLog(updateResult, logFile)

        if (!updateResult) {
            const operations = await client.deploymentOperations.list(resourceGroupName, timeStamp)
            if (operations) {
                const failedOperations = operations.filter((value => value.properties.statusMessage.error !== null))
                if (failedOperations) {
                    failedOperations.forEach(operation => {
                        switch (operation.properties.statusMessage.error.code) {
                            case 'MissingRegistrationForLocation':
                                console.log(`! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}. This resource is not avaliable in the location provided.`)
                                console.log(`+ Update the .\\Deployment\\Resources\\parameters.template.json file with a valid region for this resource and provide the file path in the -parametersFile parameter.`)
                                break;
                            default:
                                console.log(`! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}.`)
                                console.log(`! Code: ${operation.properties.statusMessage.error.code}.`)
                                console.log(`! Message: ${operation.properties.statusMessage.error.message}.`)
                                break;
                        }
                    })
                }
            }
            else {
                console.log(`! Deployment failed. Please refer to the log file for more information.`)
                console.log(`! Log: ${logFile}`)
            }
        }
        console.log(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`)
    }

    public async createAndDeploy(name: string, location: string, environment: string, luisAuthoringKey?: string, luisAuthoringRegion?: string, appId?: string, appPassword?: string) {
        await this.create(name, location, environment, luisAuthoringKey, appId, appPassword)
        await this.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion)
    }
}

