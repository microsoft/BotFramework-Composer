// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OneAuth {
  /// Levels of logging. Defines the priority of the logged message
  export enum LogLevel {
    /// Available to fully disable logging
    LogLevelNoLog = 1,
    /// Default
    LogLevelError = 2,
    LogLevelWarning = 3,
    LogLevelInfo = 4,
    LogLevelVerbose = 5,
  }

  /// Flights reflecting the values from OneAuthFlight.hpp
  export enum Flight {
    UseMsalforMsa = 2,
    // Windows Only Flights
    UseWamforMSA = 1002,
    UseWamforAAD = 1003,
  }

  export enum AccountType {
    /// Microsoft personal accounts
    Msa = 1,
    /// Microsoft work or school accounts
    Aad = 2,
    /// On-premises accounts
    OnPremises = 3,
  }

  export enum CredentialType {
    /// Access token - short-lived, used to access one resource
    AccessToken = 1,
    /// An opaque reference to account password. Can be used to retrieve cleartext password
    PasswordReference = 2,
    /// Opaque Kerberos credential reference. This is the indication that Kerberos is being used for auhentication.
    KerberosReference = 3,
  }

  export enum Status {
    /// This indicates a bug in our code, in one of our dependencies, or on the server.
    /// It may be caused by an unexpected error, exception, or bad data.
    /// This may also indicate an API attempting to return an invalid status, in which case the attempted return
    /// will be appended to the context.
    /// Retrying this request will have undefined behavior. You can still call other APIs, which may succeed. Do so at
    /// your own risk.
    Unexpected = 0,

    /// This status is reserved for future use.
    Reserved = 1,

    /// Authentication is possible, but it requires direct user interaction.
    /// Please find an appropriate time to show a dialogue to the user by calling SignIn() or
    /// AcquireTokenInteractively(). Retrying this request may return the same error, unless another application has
    /// already done the above.
    InteractionRequired = 2,

    /// There is no network available on the host machine. This status indicates that a network request was attempted.
    /// Retrying this request may return the same error, if the network state has not been fixed.
    /// You can retry this request as soon as you believe the network has changed.
    /// Please inform the user that their network is unavailable, and that they cannot be signed in because of it.
    NoNetwork = 3,

    /// The network is temporarily unavailable on the host machine. This status indicates that a network request was
    /// attempted. Retrying this request may succeed without any additional effort by the user.
    NetworkTemporarilyUnavailable = 4,

    /// The authentication server is unavailable. This status indicates that a network request was attempted.
    /// Retrying this request must be handled at exponential backoff to avoid further stressing the server.
    ServerTemporarilyUnavailable = 5,

    /// This request violates our API contract. This includes invalid parameters, calling a UI method on a non-UI
    /// std::thread, or attempting to authenticate with an unregistered application. See the result context for
    /// additional information. Retrying this request will return the same error.
    ApiContractViolation = 6,

    /// The request was cancelled by the user.
    UserCanceled = 7,

    /// The request was cancelled by the application.
    ApplicationCanceled = 8,

    /// The application is not able to complete this request.
    /// The user should contact their IT administrator for help resolving this issue.
    IncorrectConfiguration = 9,

    /// The passed in buffer is too small.
    InsufficientBuffer = 10,

    /// The provided authority is not trusted to authenticate against.
    AuthorityUntrusted = 11,
  }

  export enum AuthScheme {
    /// HTTP Basic
    Basic = 1,
    /// OAuth2
    Bearer = 2,
    /// LiveId authentication using RPS tokens
    LiveId = 3,
    /// SPNEGO
    Negotiate = 4,
    /// Windows Challenge/Response (NTLM)
    Ntlm = 5,
  }

  /// AppId for OneDrive and Sharepoint
  export const CommonAppIdsODSP = 'com.microsoft.ODSP';

  /// AppId for Office Apps: Word, Excel, Powerpoint
  export const CommonAppIdsOffice = 'com.microsoft.Office';

  /// AppId for Outlook
  export const CommonAppIdsOutlook = 'com.microsoft.Outlook';

  /// AppId for Bing
  export const CommonAppIdsBing = 'com.microsoft.Bing';

  /// AppId for Edge
  export const CommonAppIdsEdge = 'com.microsoft.Edge';

  /// AppId for Microsoft To-Do
  export const CommonAppIdsToDo = 'com.microsoft.to-do';

  /// AppId for Microsoft Intune Company Portal
  export const CommonAppIdsCompanyPortal = 'com.microsoft.CompanyPortal';

  export interface AuthResult {
    readonly account: Account;
    readonly credential: Credential;
    readonly error: Error;
    readonly correlationId: string;
  }

  export interface Account {
    readonly id: string;
    readonly accountType: AccountType;
    readonly authority: string;
    readonly sovereignty: string;
    readonly environment: string;
    readonly loginName: string;
    readonly displayName: string;
    readonly providerId: string;
    readonly realm: string;
    readonly givenName: string;
    readonly middleName: string;
    readonly familyName: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly sid: string;
    readonly accountHints: string[];
    readonly hosts: string[];
  }

  export interface Credential {
    readonly id: string;
    readonly credentialType: CredentialType;
    readonly accountId: string;
    readonly authority: string;
    readonly value: string;
    readonly target: string;
    readonly expiresOn: number;
  }

  export interface Error {
    readonly status: Status;
    readonly diagnostics: {
      readonly errorCode: string | undefined;
      readonly tag: string | undefined;
      readonly description: string | undefined;
    };
    readonly toString: string | undefined;
  }

  export class AuthParameters {
    constructor(authScheme: AuthScheme, authority: string, target: string, realm: string, accessTokenToRenew: string);
    readonly authScheme: AuthScheme;
    readonly authority: string;
    readonly realm: string;
    readonly target: string;
    readonly accessTokenToRenew: string;
    SetAdditionalParameter(key: string, value: string): void;
  }

  export class AppConfiguration {
    constructor(
      appId: string,
      appName: string,
      appVersion: string,
      languageCode: string,
      signInWindowTitle: string | undefined,
      parentWindow: any | undefined
    );
    readonly appId: string;
    readonly appName: string;
    readonly appVersion: string;
    readonly languageCode: string | undefined;
    readonly signInWindowTitle: string | undefined; // Windows only
    readonly parentWindow: any | undefined; // Windows only
  }

  export class MsaConfiguration {
    /// Constructor for MsaConfiguration
    /// @param clientId
    /// @param redirectUri
    /// @param defaultSignInScope
    /// @deprecated @param useMsalFlight no longer used and has no effect @see {@link SetFlights}
    constructor(
      clientId: string,
      redirectUri: string,
      defaultSignInScope: string,
      useMsalFlight: boolean | undefined // deprecated
    );
    readonly clientId: string;
    readonly redirectUri: string;
    readonly defaultSignInScope: string;
  }

  export class AadConfiguration {
    constructor(clientId: string, redirectUri: string, defaultSignInResource: string, preferBroker: boolean);
    readonly clientId: string;
    readonly redirectUri: string;
    readonly defaultSignInResource: string;
  }

  /// Configures the OneAuth module.
  ///
  /// @param appConfiguration The OneAuth app configuration.
  /// @param msaConfiguration The MSA configuration.
  /// @param aadConfiguration The AAD configuration.
  /// @param telemetryConfiguration The Telemetry configuration to receive telemetry dispatched events.
  /// @return false if Startup fails, true otherwise.
  export function initialize(
    appConfiguration: AppConfiguration,
    msaConfiguration: MsaConfiguration | undefined,
    aadConfiguration: AadConfiguration | undefined,
    telemetryConfiguration: TelemetryConfiguration | undefined
  ): boolean;

  /// Cancels all outstanding tasks, closes the authentication UI if any, and shuts down the OneAuth authenticator.
  /// Once called, acquiring authenticator instance(s) is only possible after calling the configuration API.
  export function shutdown(): void;

  /// Sets the language to be used within dialogs inside of OneAuth so that we may display locale correctly
  /// @param code that represents the locale to be used
  export function setLanguageCode(code: string): void;

  /// Lists the supported locale codes within OneAuth
  export function supportedLanguageCodes(): string[];

  /// Returns the current language code being used
  export function getLanguageCode(): string;

  /// Sets Logging level for OneAuth and ADAL
  /// @param level Desired logging level.
  /// @return Previous logging level. If unable to return the previous logging value, will return "error" level by default.
  export function setLogLevel(level: LogLevel): LogLevel;

  /// The OneAuth Log Callback
  /// @param level The level of the log message
  /// @param message A log message describing the event that occurred
  /// @param containsPii If the message might contain Personally Identifiable Information (PII) this will be true. Log messages possibly containing PII will not be sent to the callback unless piiEnabled is set to YES on the logger.
  export type LogCallback = (level: LogLevel, message: string, containsPii: boolean) => void;

  /// OneAuth provides a logging callback to assist diagnostics. If piiEnabled is set to NO, the callback will not be triggered for log messages that contain any user information. By default this is NO for release builds and YES for debug builds.
  /// @param enabled PII on/off flag.
  /// @return Previous PII on/off flag value.
  export function setLogPiiEnabled(enabled: boolean): boolean;

  /// Sets OneAuth Log Callback which will be called on every tracing event that meets log level and PII settings.
  /// Callback implementers must ensure its performance and reliability (e.g. do not throw exceptions, do handle concurrent calls, etc).
  /// @param callback Callback that is called by OneAuth logging facility.
  export function setLogCallback(callback: LogCallback): void;

  /// Present the sign-in UI and signs in a user to the application.
  ///
  /// A successful sign-in returns an account. A new account is created unless there is already a matching one in the
  /// local account store. Additionally, an account profile and image are read from a profile endpoint if one is
  /// available and the credentials are sufficient for the operation.
  ///
  /// **Threading:** calls from a thread other than the main thread, as well as concurrent calls, will result in a
  /// {@link Status::ApiContractViolation} error.
  ///
  /// @param accountHint Initial account hint, if you already know what account the user wants to sign in to. If this
  /// argument is empty, the user will be able to supply the account hint via account collection UI.
  /// @param authParameters What authentication scheme, authority, etc. should be used for authentication. This can
  /// either be created from an HTTP authentication challenge (using the CreateAuthParameters API), or manually.
  /// AuthParameters implicitly define the credential type. If this argument is nullptr, then modern
  /// authentication is implied (e.g. AAD, MSA), and the authentication parameters are inferred from the account hint
  /// provided.
  /// @param correlationId An identifier that correlates other telemetry events to this event.
  /// @param completion Completion (callback) that will be called once this sign in operation has been completed, for
  /// both success and failure. It receives an AuthResult instance that contains either an error or contains
  /// an account and a credential.
  ///
  /// **Error statuses returned via completion**
  /// - Status::ApiContractViolation
  /// - Status::ApplicationCanceled
  /// - Status::IncorrectConfiguration
  /// - Status::NetworkTemporarilyUnavailable
  /// - Status::NoNetwork
  /// - Status::ServerTemporarilyUnavailable
  /// - Status::UserCanceled
  /// - Status::Unexpected
  ///
  /// @see {@link AuthCompletion}
  /// @see {@link AuthParameters}
  /// @see {@link AuthResult}

  export function signInInteractively(
    accountHint: string | undefined,
    authParameters: AuthParameters | undefined,
    correlationId: string
  ): Promise<AuthResult>;

  /// Sign in a user to the app silently with an account inferred from the underlying OS infrastructure, if such
  /// an inference is possible.
  ///
  /// A successful sign-in produces a new account unless the account already exists in the local account store.
  /// Additionally, an account profile and image are read from a profile endpoint if one is available and the
  /// credentials are sufficient.
  ///
  /// At this moment, SignInSilently API is of limited use as it only supports Kerberos scenarios on macOS. Support for
  /// other scenarios will be added soon.
  ///
  /// @param authParameters What authentication scheme, authority, etc. should be used for authentication. This can
  /// either be created from an HTTP authentication challenge (using the CreateAuthParameters API), or manually.
  /// AuthParameters implicitly define the credential type. If this argument is nullptr, then default parameters will
  /// be used based on the information inferred from the account hint provided, unless the sign-in is intended for an
  /// on-premises resource. On-premises resources cannot be inferred automatically. The developer must specify
  /// authentication parameters explicitly for on-premises sign-in scenarios.
  /// @param correlationId An idetifier that correlates other telemetry events to this event.
  /// @param completion Completion (callback) that will be called once this sign in operation has been completed, for
  /// both success and failure. It receives an AuthResult instance that contains either an error or contains
  /// an account and a credential.
  ///
  /// **Error statuses returned via completion**
  /// - Status::ApiContractViolation
  /// - Status::ApplicationCanceled
  /// - Status::NetworkTemporarilyUnavailable
  /// - Status::NoNetwork
  /// - Status::ServerTemporarilyUnavailable
  /// - Status::Unexpected
  ///
  /// @see {@link AuthCompletion}
  /// @see {@link AuthParameters}
  /// @see {@link AuthResult}
  export function signInSilently(
    authParameters: AuthParameters | undefined,
    correlationId: string
  ): Promise<AuthResult>;

  /// Show a prompt for the given account and parameters.
  ///
  /// If credential acquisition is successful, an account profile and image are read from a profile endpoint if one
  /// is available and the credentials are sufficient.
  ///
  /// **Threading:** calls from a thread other than the main thread, as well as concurrent calls, will result in a
  /// {@link Status::ApiContractViolation} error.
  ///
  /// @param accountId The account id to acquire credentials for.
  /// @param authParameters What authentication scheme, authority, etc. should be used for authentication. This can
  /// either be created from an HTTP authentication challenge (using the CreateAuthParameters API), or manually.
  /// AuthParameters implicitly define the credential type. If this argument is nullptr, then modern
  /// authentication is implied (e.g. AAD, MSA), and the authentication parameters are inferred from the account hint
  /// provided.
  /// @param correlationId An idetifier that correlates other telemetry events to this event.
  /// @param completion Completion (callback) that will be called once this sign in operation has been completed, for
  /// both success and failure. It receives an AuthResult instance that contains either an error or contains
  /// an account and a credential.
  ///
  /// **Error statuses returned via completion**
  /// - Status::ApiContractViolation
  /// - Status::ApplicationCanceled
  /// - Status::IncorrectConfiguration
  /// - Status::NetworkTemporarilyUnavailable
  /// - Status::NoNetwork
  /// - Status::ServerTemporarilyUnavailable
  /// - Status::UserCanceled
  /// - Status::Unexpected
  ///
  /// @see {@link AuthCompletion}
  /// @see {@link AuthParameters}
  /// @see {@link AuthResult}
  export function acquireCredentialInteractively(
    accountId: string,
    authParameters: AuthParameters,
    correlationId: string
  ): Promise<AuthResult>;

  /// Acquire a credential silently for the given account and parameters.
  ///
  /// This method will never prompt, but may fail if it cannot silently acquire a credential. If it does fail, the
  /// error status may suggest resorting to interactive credential aquisition (see {@link
  /// Status::InteractionRequired}).
  ///
  /// @param accountId The account id to acquire credentials for.
  /// @param authParameters What authentication scheme, authority, etc. should be used for authentication. This can
  /// either be created from an HTTP authentication challenge (using the CreateAuthParameters API), or manually.
  /// AuthParameters implicitly define the credential type. If this argument is nullptr, then modern
  /// authentication is implied (e.g. AAD, MSA), and the authentication parameters are inferred from the account hint
  /// provided.
  /// @param correlationId An idetifier that correlates other telemetry events to this event.
  /// @param completion Completion (callback) that will be called once this sign in operation has been completed, for
  /// both success and failure. It receives an AuthResult instance that contains either an error or contains
  /// an account and a credential.
  ///
  /// **Error statuses returned via completion**
  /// - Status::ApiContractViolation
  /// - Status::ApplicationCanceled
  /// - Status::IncorrectConfiguration
  /// - Status::InteractionRequired
  /// - Status::NetworkTemporarilyUnavailable
  /// - Status::NoNetwork
  /// - Status::ServerTemporarilyUnavailable
  /// - Status::Unexpected
  ///
  /// @see {@link AuthCompletion}
  /// @see {@link AuthParameters}
  /// @see {@link AuthResult}
  export function acquireCredentialSilently(
    accountId: string,
    authParameters: AuthParameters,
    correlationId: string
  ): Promise<AuthResult>;

  /// Cancels all ongoing tasks and dismisses the UI (if any).
  /// Completions for all ongoing tasks are called synchronously, i.e. before ```CancelAllTasks``` returns.
  /// Completions for tasks scheduled after ```CancelAllTasks``` was called will not be executed until
  /// CancelAllTasks returns control to the caller.
  export function cancelAllTasks(): void;

  /// Get an account for a given account id.
  ///
  /// This API is likely to result in a blocking read from a local persistent store.
  ///
  /// @param accountId The account id for the desired account
  /// @return A shared pointer to the account.
  /// @see {@link Account}
  export function readAccountById(accountId: string): Promise<Account>;

  /// Get all accounts known to OneAuth from local persistent store(s).
  ///
  /// This API will get accounts from the OneAuth store and any "external" account stores, e.g. the Office or ODSP
  /// identity cache. The accounts from "external" stores are de-duplicated against the OneAuth account store. Multiple
  /// blocking reads from local persistent stores are likely to result from this call.
  ///
  /// @return All accounts that OneAuth knows about.
  /// @see {@link Account}
  /// @see {@link GetAssociatedAccounts}
  export function readAllAccounts(): Promise<Account[]>;

  /// Associate an account with a specified application group.
  ///
  /// Accounts can be associated with applications via application group identifiers. Application group identifiers are
  /// arbitrary strings, each associated with a set of applications that choose to help each other identify accounts
  /// that they use.
  ///
  /// This call may result in multiple blocking local I/O operations.
  ///
  /// @param accountId The account id belonging to the account to associate.
  /// @see {@link Account}
  /// @see {@link DisassociateAccount}
  export function associateAccount(accountId: string): Promise<boolean>;

  /// Disassociate an account from a specified application group.
  ///
  /// This call may result in multiple blocking local I/O operations.
  ///
  /// @param accountId The account id belonging to the account to disassociate.
  /// @see {@link Account}
  /// @see {@link AssociateAccount}
  export function disassociateAccount(accountId: string): Promise<boolean>;

  /// Get all accounts associated with the specified application groups.
  ///
  /// This will read accounts from local OneAuth as well as "external" (e.g. Office or ODSP) stores, if any. The
  /// accounts from "external" stores are de-duplicated against the OneAuth account store. This call may result in
  /// multiple blocking reads from local persistent stores.
  ///
  /// @param appGroup A list of application groups identifiers.
  /// @return An array of account objects. An empty array is returned if no known accounts associated with the
  /// specified app groups could be read.
  /// @see {@link Account}
  /// @see {@link AssociateAccount}
  /// @see {@link DisassociateAccount}
  /// @see {@link GetAllAccounts}
  export function readAssociatedAccounts(appGroup: string[]): Promise<Account[]>;

  /// Get a profile image associated with the specified account.
  ///
  /// This API does not perform network calls to retrieve the image; the image, if any, is read from a local cache
  /// only. This API may result in multiple blocking local I/O operations.
  ///
  /// @param accountId The account id belonging to the account to get the profile image for.
  /// @return An image blob as it was returned by the profile endpoint. If no image associated with the account is
  /// locally available, the returned blob is empty.
  /// @see {@link Account}
  export function readProfileImage(accountId: string): Promise<Uint8Array>;

  /// Delete all the accounts that OneAuth knows about
  ///
  /// This is a TEST API and should not be used in production scenarios
  /// This is due to the API deleting data that is not exclusive to the calling application.
  /// There are no network calls involved in deleting all accounts and as such should not be blocking, allthough
  /// given a lot of accounts, it may hang a few milliseconds before returning.
  export function testDeleteAllAccounts(): void;

  /// Set the current flights for OneAuth
  /// This API needs to be called before initializing OneAuth
  /// Once OneAuth has been initialized this will have no effect on the flights that are set till it is
  /// shut down and started again.
  /// This will override anything that has already been set.
  ///
  /// This call should not be blocking and should return instantly
  /// @param should be an array containing the corresponding @see {@link Flights} to be activated based on the enum defined here
  export function setFlights(flights: Array<Flight>): void;

  /// Get the current flights that have been set on OneAuth
  ///
  /// This call should not be blocking and should return instantly
  /// @return will be an array of flights corresponding to the correct enum of Flights defined here
  export function getFlights(): Promise<Array<Flight>>;

  export enum AudienceType {
    Automation = 0,
    Preproduction = 1,
    Production = 2,
  }

  /// Callback function that receives data from OneAuth library that is meant to be sent using Aria SDK.
  /// https://authtelemetry.visualstudio.com/Microsoft%20Auth%20Telemetry%20System/_wiki/wikis/Microsoft%20Auth%20Telemetry%20System.wiki/28/Win32?anchor=setting-up-your-telemetry-dispatcher
  ///
  /// @param data The data that needs to be sent to the telemetry server.
  export type TelemetryDispatcher = (data: Data) => void;

  export interface TelemetryConfigurationConstructor {
    new (
      audienceType: AudienceType,
      sessionId: string,
      dispatcher: TelemetryDispatcher | undefined,
      allowedResources: string[]
    ): TelemetryConfiguration;
  }

  export interface TelemetryConfiguration extends TelemetryConfigurationConstructor {
    readonly audienceType: AudienceType;
    readonly sessionId: string;
    readonly telemetryDispatcher: TelemetryDispatcher | undefined;
    readonly allowedResources: string[];
  }

  export interface StringMap {
    readonly [key: string]: string;
  }

  export interface IntMap {
    readonly [property: string]: number;
  }

  export interface BooleanMap {
    readonly [property: string]: boolean;
  }

  export interface Data {
    readonly name: string;
    readonly isInstrumentationError: boolean;
    readonly stringMap: StringMap;
    readonly intMap: IntMap;
    readonly int64Map: IntMap;
    readonly boolMap: BooleanMap;
  }
}
