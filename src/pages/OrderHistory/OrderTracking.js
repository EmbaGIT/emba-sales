import { useContext, useEffect, useState, Fragment } from 'react'
import Loader from "react-loader-spinner";
import ReactPaginate from 'react-paginate'
import { post } from '../../api/Api'
import { getHost } from '../../helpers/host'
import AuthContext from '../../store/AuthContext'

const OrderTracking = () => {
  const { user_uid } = useContext(AuthContext)
  const [emptyOrders, setEmptyOrders] = useState({})
  const [orders, setOrders] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [classNames, setClassNames] = useState(
      Array(10)
          .fill(undefined)
          .map((_) => ({ hidden: true }))
  )
  const [spinners, setSpinners] = useState([])
  const [gettingActiveStatus, setGettingActiveStatus] = useState(false);
  const [pageInfo, setPageInfo] = useState({})
  const [page, setPage] = useState(0)

  const showItems = (i, status, uid) => {
      setClassNames(classNames.map((name, index) => {
          if (i === index) {
              if (classNames[i].hidden) {
                  return {hidden: false}
              }

              return {hidden: true}
          }

          return name.hidden ? name : {hidden: true}
      }))

      setSpinners(spinners?.map((_, index) => {
        if (i === index && classNames[i].hidden) {
          return {show:true}
        }
        return {show:false}
      }))

      if (status === 'IN_PROGRESS' && classNames[i].hidden) {
        setGettingActiveStatus(true)
        post(`${getHost('erp/report', 8091)}/api/order-track/specific`, {
          sales_uid: uid
        }).then(res => {
          setGettingActiveStatus(false)
          setOrders(orders.map(order => {
            if (order.uid_sales_order !== uid) {
              return order
            }
            return res.sales_group[0]
          }))
        })
      }
  }

  useEffect(() => {
    setIsFetching(true)
    // '8f859d20-e5f4-11eb-80d7-2c44fd84f8db'
    post(`${getHost('erp/report', 8091)}/api/order-track?page=${page}&size=3`, {
      uid: '8f859d20-e5f4-11eb-80d7-2c44fd84f8db'
    }).then(res => {
      console.log(res)
      setIsFetching(false)
      setSpinners(Array(res?.salesGroups?.length).fill().map(_ => ({show: false})))
      setPageInfo({
        totalPages: res.totalPages,
        totalElements: res.totalElements
      })
      if (res.hasOwnProperty('info')) {
        setEmptyOrders(res)
      } else {
        setOrders(res?.salesGroups)
      }
    })
  }, [page])

  const paginate = (n) => {
    setPage(+n.selected)
  }

  useEffect(() => console.log(emptyOrders), [emptyOrders])
  useEffect(() => console.log(orders), [orders])

  return (
    <div className='container-fluid row'>
      <div className='col-12 d-flex justify-content-between align-items-end mb-3'>
        <h1>Sifarişlərinin izlənməsi</h1>
      </div>
      {
        isFetching && <div
            className='col-12 d-flex justify-content-center w-100'
            style={{backdropFilter: 'blur(2px)', zIndex: '100'}}
        >
            <Loader
                type='ThreeDots'
                color='#00BFFF'
                height={60}
                width={60}
            />
        </div>
      }
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
                    <th scope='col' className='long'>Mərhələlər</th>
                    <th scope='col' className='long'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order, i) => (
                    <Fragment key={i}>
                      <tr key={order.uid_sales_order} onClick={showItems.bind(null, i, order.statusType, order.uid_sales_order)} className='parent-row'>
                        <td className='long'>{order.sales_order}</td>
                        <td className='short'>{order.customer}</td>
                        <td className='short'>{order.amount}</td>
                        <td className={`long ${(gettingActiveStatus && spinners[i].show) ? 'text-center' : ''}`}>
                          {
                            (gettingActiveStatus && spinners[i].show) ? <div
                                className='col-12 d-flex justify-content-center w-100'
                                style={{backdropFilter: 'blur(2px)', zIndex: '100'}}
                            >
                                <Loader
                                    type='ThreeDots'
                                    color='#00BFFF'
                                    height={60}
                                    width={60}
                                />
                            </div> : <ol>
                              {
                                order.status.info.map((status, i) => (
                                  <li key={i}>{status}</li>
                                ))
                              }
                            </ol>
                          }
                        </td>
                        <td className='short'>
                          <span className={`order-tracking-status ${order.statusType === 'READY' ? 'completed' : 'in-progress'}`}>
                            {order.statusType === 'READY'
                              ? 'Bitib'
                              : 'Davam edir'}
                          </span>
                        </td>
                      </tr>

                      <tr className={classNames[i]?.hidden ? 'hidden' : 'show'}>
                        <td colSpan={5} className='p-0'>
                          <div className='table-responsive'>
                            <table className='table table-bordered mb-0'>
                              <thead>
                                <tr>
                                  <th className='long'>Xarakteristika</th>
                                  <th className='short'>Sayı</th>
                                  <th className='short'>Cəmi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  order.items?.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td className='long'>{item.product_uid || 'Xarakteristika yoxdur'}</td>
                                        <td className='short'>{item.product_quantity}</td>
                                        <td className='short'>{item.product_amount} AZN</td>
                                      </tr>
                                    )
                                  })
                                }
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {
        isFetching
        ? null
        : (
          pageInfo?.totalPages > 1 && <div className='d-flex justify-content-center'>
            <ReactPaginate
              previousLabel='Əvvəlki'
              nextLabel='Növbəti'
              previousClassName='page-item'
              nextClassName='page-item'
              previousLinkClassName='page-link'
              nextLinkClassName='page-link'
              breakLabel='...'
              breakClassName='break-me'
              pageCount={pageInfo.totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={paginate}
              containerClassName='pagination'
              activeClassName='active'
              pageClassName='page-item'
              pageLinkClassName='page-link'
              forcePage={page}
            />
          </div>
        )
      }
    </div>
  )
}

export default OrderTracking