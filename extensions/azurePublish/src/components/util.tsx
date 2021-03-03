import { getTenants, getARMTokenForTenant } from '@bfc/extension-client';
import jwtDecode from 'jwt-decode';
import { SharedColors } from '@uifabric/fluent-theme';
import { AzureResourceTypes } from '../types';

export function decodeToken(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch (err) {
    console.error('decode token error in ', err);
    return null;
  }
}

export function removePlaceholder(config:any){
  try{
    if(config){
      let str = JSON.stringify(config);
      str = str.replace(/<[^>]*>/g, '');
      const newConfig = JSON.parse(str);
      return newConfig;
    } else {
      return undefined;
    }
  }catch(e){
    console.error(e);
  }
};

export function getExistResources (config){
  const result = [];
  if(config){
    // If name or hostname is configured, it means the webapp is already created.
    if(config.hostname || config.name){
      result.push(AzureResourceTypes.WEBAPP);
    }
    if(config.settings?.MicrosoftAppId){
      result.push(AzureResourceTypes.BOT_REGISTRATION);
      result.push(AzureResourceTypes.APP_REGISTRATION);
    }
    if(config.settings?.luis?.authoringKey){
      result.push(AzureResourceTypes.LUIS_AUTHORING);
    }
    if(config.settings?.luis?.endpointKey){
      result.push(AzureResourceTypes.LUIS_PREDICTION);
    }
    if(config.settings?.qna?.subscriptionKey){
      result.push(AzureResourceTypes.QNA);
    }
    if(config.settings?.applicationInsights?.InstrumentationKey){
      result.push(AzureResourceTypes.APPINSIGHTS);
    }
    if(config.settings?.cosmosDb?.authKey){
      result.push(AzureResourceTypes.COSMOSDB);
    }
    if(config.settings?.blobStorage?.connectionString){
      result.push(AzureResourceTypes.BLOBSTORAGE);
    }
    return result;
  } else return [];
}

export const iconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

const TENANTID = 'tenantId';
const getTenantsFromCache = ()=>{
  return window.localStorage.getItem(TENANTID);
};

export const getARMToken = async() => {
  let tenant = getTenantsFromCache();
  if(!tenant){
    const tenants = await getTenants();
    // set tenantId in cache.
    window.localStorage.setItem(TENANTID, tenants[0].tenantId);
    tenant = tenants[0].tenantId;
  }
  const token = await getARMTokenForTenant(tenant);
  const decoded = decodeToken(token);
  return decoded ? {
    token: token,
    email: decoded.upn,
    name: decoded.name,
    expiration: (decoded.exp || 0) * 1000, // convert to ms,
    sessionExpired: false,
  }:{};
}

