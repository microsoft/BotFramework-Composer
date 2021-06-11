# Azure Publish Services

Services to manage Azure Resource Groups, Apps, and Azure Resources

## Azure Resource Services

Resource Services each provide a facade for an authenticated client to manage an Azure Resource for a resource group.

## Initializing a service

Create a new instance of a particular service by calling its `create` method. The create method will return an object with available methods for managing that Azure Resource.

## Implementing a new Azure Resource Service
- Define a create method that will return a new instance of the service for that Azure Resource
- Save authentication details for the service in the closure of the create method
- Returns methods that will be needed for managing an Azure Resource (create, read, update, delete, etc)
- Includes a provision method to coordinate all the steps of provisioning the resource

| Method      | Description |
| ----------- | ----------- |
| checkNameAvailability | checks for name uniqueness |
| create | creates a resource |
| deleteMethod | deletes a resource |
| get | gets a resource |
| list | lists all resources of type by subscription |
| listByResourceGroup | lists all resources of type by resource group |
| provision | orchestrating method that fulfills all the steps of provisioning. idempotent - creates or updates the resource as needed |
| update | updates a resource |

