const swaggerOptions ={
    swaggerDefinition:{
      info: {
        title: 'My First API info',
        version: '3.0.0',
        description: 'swagger에서 POST 처리 할줄 몰라서 쨋든 안됨!! POST는안되!!',
        contact: {
          name: 'antangle'
        },
        servers: ["http://api.aptioncompany.com:9000"]
      },
      host: "api.aptioncompany.com:9000",
      basepath: "/",
    },
    apis: ['./swagger/swagger.yaml']
  }
  module.exports ={
      swaggerOptions
  }