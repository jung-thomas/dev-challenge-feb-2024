const cds = require('@sap/cds')

cds
    .on('serving', service => {
        addLinkToGraphQl(service)
    })

function addLinkToGraphQl(service) {
    const provider = (entity) => {
        if (entity) return // avoid link on entity level, looks too messy
        let isGraphQL
        for (const endpoint of service.endpoints) {
            if(endpoint && endpoint.kind === 'graphql'){
                isGraphQL = true
            }
        }
        if(isGraphQL){
            return { href: 'graphql', name: 'GraphQl', title: 'Show in GraphQL' }
        }     
    }
    // Needs @sap/cds >= 4.4.0
    service.$linkProviders ? service.$linkProviders.push(provider) : service.$linkProviders = [provider]
}