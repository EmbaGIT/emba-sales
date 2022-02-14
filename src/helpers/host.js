// using url for external requests. and port for internal requests
export const getHost = (url, port) => window.location.host.includes('emba') ? `http://${url}.emba.store` : `http://bpaws01l:${port}`