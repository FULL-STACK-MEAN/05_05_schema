// Esquemas de validación en colecciones MongoDB

// Operador $jsonSchema

// Se puede implementar de dos maneras

// 1.- En la creacción de la colección

use clinica2

db.createCollection("pacientes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["nombre","apellidos","dni"],
            properties: {
                nombre: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
                apellidos: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
                dni: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
                edad: {
                    bsonType: ["number","null"],
                    minimum: 0,
                    maximum: 120,
                    description: "debe ser number entre 0 y 120 ó null"
                },
                fechaNacimiento: {
                    bsonType: "date",
                    description: "debe ser date"
                },
                direccion: {
                    bsonType: "object",
                    properties: {
                        calle: {
                            bsonType: "string",
                            description: "debe ser string"
                        },
                        cp: {
                            bsonType: "string",
                            description: "debe ser string"
                        },
                        localidad: {
                            bsonType: "string",
                            enum: ["Madrid","Alcorcón","Getafe"],
                            description: "debe ser string"
                        },
                    }
                }
            }
        }
    }
})

db.pacientes.insert({nombre: "Juan", apellidos: "Gómez"})  // Falta el dni como obligatorio
WriteResult({
    "nInserted" : 0,
    "writeError" : {
            "code" : 121,
            "errmsg" : "Document failed validation"
    }
})

db.pacientes.insert({nombre: "Juan", apellidos: "Gómez", dni: "576576575A"}) 
WriteResult({ "nInserted" : 1 })

db.pacientes.insert({nombre: "Juan", apellidos: "Gómez", dni: "576576575A", edad: "25"}) // Error en tipo de Edad
WriteResult({
    "nInserted" : 0,
    "writeError" : {
            "code" : 121,
            "errmsg" : "Document failed validation"
    }
})

db.pacientes.insert({nombre: "Juan", apellidos: "Gómez", dni: "576576575A", edad: -10}) // Error de rango

db.pacientes.insert({
    nombre: "Juan", 
    apellidos: "Gómez", 
    dni: "576576575A", 
    direccion: {
        calle: 'Gran Vía, 80',
        cp: '28033',
        localidad: 'Bilbao' // Error de rango (no está en el enum)
    }
}) 

// aunque valida sigue manteniendo un concepto squemaless puesto que permite campos que no 
// estén en el esquema de validación

> db.pacientes.insert({nombre: "Juan", apellidos: "Gómez", dni: "576576575A", comp: 'Adeslas'})

// 2.- En caliente sobre colecciones ya existentes

db.empleados.insert({nombre: "Pedro", apellidos: "López"})
db.empleados.insert({nombre: 13})

// Si los registros ya existentes incumplen la nueva validación se pueden mantener pasándole a la
// validación la opción validationLevel: moderate

db.runCommand({
    collMod: "empleados",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["nombre","apellidos","dni"],
            properties: {
                nombre: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
                apellidos: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
                dni: {
                    bsonType: "string",
                    description: "debe ser string y obligatorio"
                },
            }
        }
    },
    validationLevel: "moderate"
})

// Para visualizar la info de validación de una colección (y otros datos)

db.getCollectionInfos({name: "empleados"})