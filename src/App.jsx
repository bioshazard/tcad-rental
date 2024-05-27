import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useSearchParams } from 'react-router-dom'
import { useTCAD } from './useTCAD'
import { hydrate } from 'react-dom'

function App() {
  const [token, setToken] = useState()
  // const [accounts, setAccounts] = useState()
  const [filter, setFilter] = useState(0)
  let [searchParams, setSearchParams] = useSearchParams();
  const tcad = useTCAD();

  useEffect( () => {
    const year = searchParams.get('year')
    const subdivisions = searchParams.getAll('subdivision')
    if(!year || !subdivisions) return
    
    // If year and subdivision are set, hydrate page
    console.log("HYDRATING...")
    tcad.loadAccounts(year, subdivisions)

    return () => {}
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    // getAccounts(e.target.year.value)
    // let params = serializeForm(e);
    const params = {
      year: e.target.year.value,
      subdivision: e.target.subdivision.value.split(",")
    }
    console.log({params})
    setSearchParams(params);
  }

  const filters = [
    "ALL",
    "RENTAL",
    "OWNER",
  ]

  async function rotateFilter() {
    setFilter( prev => (prev + 1) % filters.length )
  }

  // function compareFn(a, b) {
  //   if (a is less than b by some ordering criterion) {
  //     return -1;
  //   } else if (a is greater than b by the ordering criterion) {
  //     return 1;
  //   }
  //   // a must be equal to b
  //   return 0;
  // }

  function addrSort(a, b) {
    const aParts = a.streetPrimary.split(" ")
    const bParts = b.streetPrimary.split(" ")
    
    if( aParts[1] < bParts[1] ) return -1;
    if( aParts[1] > bParts[1] ) return 1;
    if( aParts[0] < bParts[0] ) return -1;
    if( aParts[0] > bParts[0] ) return 1;

    // if( a.streetName < b.streetName ) return -1;
    // if( a.streetName > b.streetName ) return 1;
    // if( a.streetNum < b.streetNum ) return -1;
    // if( a.streetNum > b.streetNum ) return 1;
    return 0
  }

  const accounts = tcad.accounts
    ? tcad.accounts.filter( account => filters[filter] === "ALL" || filters[filter] === (account.owner && "OWNER" || "RENTAL") )
    : []

  return (
    <div className='p-2 flex flex-col gap-2'>
      <h1 className='text-2xl flex flex-row justify-between'>
        <span>Rental Tracker</span>
        {/* <button>Reset</button> */}
      </h1>
      <div className="flex flex-col gap-2">
        {/* <button onClick={() => setCount((count) => count + 1)}> */}
          {/* count is {token} */}
        {/* </button> */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
          <div className='flex flex-col gap-2'>
            <div>
              <span>Subdivision: </span>
              <input type="text" name="subdivision" defaultValue={searchParams.getAll('subdivision').join(",")} placeholder="S123456,S234567" className='border py-1 px-2'/>
            </div>
            <div>
              <span>Year: </span>
              <input type="text" name="year" defaultValue={searchParams.get('year') ?? new Date().getFullYear()} className='border py-1 px-2'/>
            </div>
          </div>
          <div className='flex flex-row gap-2'>
            <button className='border py-1 px-2 rounded'>Search</button>
            <button type='button' className='border py-1 px-2 rounded' onClick={rotateFilter}>Filter: {filters[filter]} ({accounts.length})</button>
          </div>
          {/* <button onClick={() => getAccounts(2024)}>LOAD</button> */}
        </form>
        {accounts.length > 0 && (
          <div>
            <table className='border-separate border-spacing-2 border border-slate-500'>
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>ADDRESS</th>
                  <th>MAILING</th>
                </tr>
              </thead>
              <tbody>
                {accounts.filter( account => filters[filter] === "ALL" || filters[filter] === (account.owner && "OWNER" || "RENTAL") )
                .sort( addrSort )
                .map( (account, index) => (
                  <tr key={index}>
                    <td className='border border-slate-700 p-2'>{account.owner && "OWNER" || "RENTAL"}</td>
                    <td className='border border-slate-700 p-2'>
                      <a className='text-blue-500' target='_blank' href={`https://travis.prodigycad.com/property-detail/${account['pid']}/${account['pYear']}`}>
                        {account.streetPrimary}
                      </a>
                    </td>
                    <td className='border border-slate-700 p-2'>{account.addrDeliveryLine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) || (
          <p>(click Load to see results)</p>
        )}
      </div>
    </div>
  )
}

export default App
