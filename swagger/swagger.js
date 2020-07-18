const swaggerOptions ={
    swaggerDefinition:{
      info: {
        title: 'My First API info',
        version: '3.0.0',
        description: 'API info',
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