import { useState } from "react";

export function useTCAD(props) {

  // const [token, setToken] = useState()
  const [accounts, setAccounts] = useState()

  async function getToken(office) {
    const cadToken = {
      path: 'https://prod-container.trueprodigyapi.com/trueprodigy/cadpublic/auth/token',
      payload: { office },
      auth: {
        user: 'cadPublic',
        pass: '*MirsWtCq%cr@!1'
      }
    };
    const token = await fetch(cadToken.path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${cadToken.auth.user}:${cadToken.auth.pass}`)}`,
      },
      body: JSON.stringify(cadToken.payload),
    })
    .then(response => response.json())
    .then(response => response.user.token)
    return token
  }

  async function loadAccounts(year, subdivision) {
    const token = await getToken()
    const queryParams = "page=1&pageSize=20&sortField=geoID&sortDirection=ascending"
    const cadProperties = {
      "path": `https://prod-container.trueprodigyapi.com/public/property/advancedsearch?${queryParams}`,
      "payload": {
        "advanced": true,
        "pYear": {
            "operator": "=",
            "value": year
        },
        "sortOrder": "geoID",
        "abstractSubdivisionName": {
            "operator": "in",
            "value": [ // could support multiple...
              subdivision
            ]
        }
      }
    }

    const headers = {
      'Content-Type': "application/json",
      'Authorization': token,
    }

    const properties = await fetch(cadProperties.path, {
      method: "POST",
      headers,
      body: JSON.stringify(cadProperties.payload),
    })
    .then( response => response.json() )

    const cadAccount = {
      "path": "https://prod-container.trueprodigyapi.com/public/property/search",
      "payload": {
        "pid": {
          "operator": "in",
          "value": properties.results.map(home => `${home.pid}`)
        },
        "pYear": {
          "operator": "=",
          "value": `${year}`
        },
      }
    }
    
    const pidAccounts = await fetch( cadAccount.path, {
      method: "POST",
      headers,
      body: JSON.stringify(cadAccount.payload),
    })
    .then( response => response.json())
    .then( response => response.results.map( result => {

      result.streetPrimary = result.streetPrimary.toUpperCase()
        .replace(" DRIVE", " DR")
        .replace(" LP LOOP", " LP")
        .replace(" LOOP", " LP")

      result.addrDeliveryLine = result.addrDeliveryLine.toUpperCase()
        .replace(" DRIVE", " DR")
        .replace(" LP LOOP", " LP")
        .replace(" LOOP", " LP")
      
      result.owner = result.streetPrimary === result.addrDeliveryLine

      return result
      
    }))

    setAccounts(pidAccounts)
  }

  return {
    accounts,
    loadAccounts,
  }
}
