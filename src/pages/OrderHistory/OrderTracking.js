import { useContext, useEffect, useState } from 'react'
import { post } from '../../api/Api'
import { getHost } from '../../helpers/host'
import AuthContext from '../../store/AuthContext'

const OrderTracking = () => {
  const { user_uid } = useContext(AuthContext)
  const [emptyOrders, setEmptyOrders] = useState({})
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // '8f859d20-e5f4-11eb-80d7-2c44fd84f8db'
    post(`${getHost('erp/report', 8091)}/api/order-track?page=0&size=10`, {
      uid: '8f859d20-e5f4-11eb-80d7-2c44fd84f8db'
    }).then(res => {
      console.log(res)
      if (res.hasOwnProperty('info')) {
        setEmptyOrders(res)
      } else {
        setOrders(res?.salesGroups)
      }
    })
  }, [])

  useEffect(() => console.log(emptyOrders), [emptyOrders])
  useEffect(() => console.log(orders), [orders])

  return (
    <div className='container-fluid row'>
      <div className='col-12 d-flex justify-content-between align-items-end mb-3'>
        <h1>Sifarişlərinin izlənməsi</h1>
      </div>
      {/* {
        !!Object.keys(emptyOrders).length && (
          <div className='alert alert-danger' role='alert'>
            {emptyOrders.info}
          </div>
        )
      } */}
      {
        !!orders?.length && (
          <div>
            <div className='table-responsive sales-table'>
              <table className='table table-striped table-bordered'>
                <thead>
                  <tr>
                    <th scope='col' className='long'>Realizasiya sənədi</th>
                    <th scope='col' className='short'>Müştəri A.S.A.</th>
                    <th scope='col' className='short'>Miqdar</th>
                    <th scope='col' className='long'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map(order => (
                    <tr key={order.uid_sales_order}>
                      <td className='long'>{order.sales_order}</td>
                      <td className='short'>{order.customer}</td>
                      <td className='short'>{order.amount}</td>
                      <td className='long'>
                        <ol>
                          {
                            order.status.info.map((status, i) => (
                              <li key={i}>{status}</li>
                            ))
                          }
                        </ol>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default OrderTracking