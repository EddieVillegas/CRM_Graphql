const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario.model')
const Cliente = require('../models/Clientes.model')
const { 
    getProducto,
    getProductos,
    deleteProducto,
    updateProducto,
    createProducto,
} = require('../controllers/Producto.controller')

const  {
    getCliente,
    getClientes,
    updateCliente,
    createCliente,
    deleteCliente,
    getClientesByVendedor,
} = require('../controllers/Cliente.controller')

const resolvers = {

    Query: {
        getCliente,
        getClientes,
        getProducto,
        getProductos,
        getClientesByVendedor,
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.SECRET)
            return userId
        }
    },
    
    Mutation: {
        deleteCliente,
        updateCliente,
        createCliente,
        deleteProducto,
        updateProducto,
        createProducto,
        createUsuario: async (_, {input}) => {
            const { email, password } = input
            const usuarioExists = await Usuario.findOne({email})
            if(usuarioExists) throw new Error('El usuario ya esta registrado')
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
            try {
                const usuario = new Usuario(input)
                usuario.save()
                return usuario
            } catch (error) {
                console.log(error)
            }
        },
        authUser: async (_, {input}) => {
            const { email, password } = input
            const existsUser = await Usuario.findOne({email})
            if(!existsUser) throw new Error('email y/o password incorrectos')
            const correctPassword = await bcryptjs.compare(password, existsUser.password)
            if(!correctPassword) throw new Error('email y/o password incorrectos')
            const token = jwt.sign({ id: existsUser.id }, process.env.SECRET ,{expiresIn: '24h'})
            return { token }
        },
        
    }

}

module.exports = resolvers