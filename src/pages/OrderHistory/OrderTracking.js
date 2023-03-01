import { useContext, useEffect, useState } from 'react'
import { post } from '../../api/Api'
import { getHost } from '../../helpers/host'
import AuthContext from '../../store/AuthContext'

const OrderTracking = () => {
  const { user_uid } = useContext(AuthContext)
  const [emptyOrders, setEmptyOrders] = useState({})
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // 'c834a64a-f516-11eb-80d8-2c44fd84f8db'
    post(`${getHost('erp/report', 8091)}/api/order-track?page=0&size=10`, {
      uid: 'c834a64a-f516-11eb-80d8-2c44fd84f8db'
    }).then(res => {
      console.log(res)
      if (res.hasOwnProperty('info')) {
        setEmptyOrders(res)
      } else {
        setOrders(res.sales_group)
      }
    })
  }, [])

  useEffect(() => console.log(emptyOrders), [emptyOrders])
  useEffect(() => console.log(orders), [orders])

  return (
    <div>
      <h1>Sifarişlərinin izlənməsi</h1>
      {
        !!Object.keys(emptyOrders).length && (
          <div className='alert alert-danger' role='alert'>
            {emptyOrders.info}
          </div>
        )
      }
      {
        !!orders.length && (
          <div>
            <div className="table-responsive">
              <table className="table bordered striped">
                <thead>
                  <tr>
                    <th scope='col'>#</th>
                    <th scope='col'>Müştəri A.S.A.</th>
                    <th scope='col'>Sifariş</th>
                    <th scope='col'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i}>
                      <td>{+i}</td>
                      <td><span className="cursor-pointer text-primary font-weight-bolder">{order.client_name}</span></td>
                      <td>
                        {order.status === 'ORDER_FAILED' &&
                          <span className="badge bg-warning text-dark">Uğursuz sifariş</span>}
                        {order.status === 'ORDERED' &&
                          <span className="badge bg-success">Tamamlandı</span>}
                        {order.status === 'SAVED' &&
                          <span className="badge bg-primary">Yadda saxlanılan</span>}
                      </td>
                      <td>{order.createdAt} {order.creationTime}</td>
                      <td>{order.totalPrice} AZN</td>
                      {/*<td>{order.orderNum}</td>*/}
                      <td>
                        {(order.status === 'ORDER_FAILED' || order.status === 'SAVED') &&
                          <i className="fas fa-trash-alt text-danger cursor-pointer" />}
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