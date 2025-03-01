import os

import pymongo
import certifi
from bson import DBRef
from bson.objectid import ObjectId
from typing import TypeVar, Generic, List, get_origin, get_args
import json

T = TypeVar('T')  # Definimos un parámetro de tipo genérico 'T' para la clase 'InterfaceRepositorio'


class InterfaceRepositorio(Generic[T]):
    def __init__(self):
        # Obtenemos la ubicación del certificado CA de certifi
        ca = certifi.where()

        # Cargamos la configuración de datos desde el archivo config.json
        dataConfig = self.loadFileConfig()

        # Creamos una conexión al servidor de MongoDB utilizando la cadena de conexión especificada en la configuración
        # y utilizando el certificado CA para la conexión TLS
        client = pymongo.MongoClient(dataConfig["data-db-connection"], tlsCAFile=ca)

        # Accedemos a la base de datos en MongoDB, cuyo nombre está especificado en la configuración
        self.baseDatos = client[dataConfig["name-db"]]

        # Obtenemos el nombre de la colección a partir del tipo genérico 'T' especificado en la clase
        # Esto asume que el primer tipo en el argumento de tipo genérico representa el modelo de datos
        theClass = get_args(self.__orig_bases__[0])
        self.coleccion = theClass[0].__name__.lower()

    def loadFileConfig(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))  # Ubicación del archivo actual
        config_path = os.path.join(base_dir, "../Config/config.json")  # Ajusta la ruta correctamente

        with open(config_path) as f:
            return json.load(f)

    def save(self, item: T):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]
        elId = ""

        # Transformamos las referencias en el objeto 'item' antes de guardar en la base de datos
        item = self.transformRefs(item)

        # Verificamos si el objeto 'item' tiene el atributo '_id' y si tiene un valor no vacío
        if hasattr(item, "_id") and item._id != "":
            elId = item._id
            _id = ObjectId(elId)

            # Eliminamos el atributo '_id' del objeto 'item' para que no se inserte nuevamente en caso de actualización
            laColeccion = self.baseDatos[self.coleccion]
            delattr(item, "_id")

            # Convertimos 'item' a un diccionario para utilizarlo en la actualización de la base de datos
            item = item.__dict__

            # Creamos el diccionario de actualización con el operador $set
            updateItem = {"$set": item}

            # Realizamos la actualización en MongoDB utilizando el método update_one
            x = laColeccion.update_one({"_id": _id}, updateItem)
        else:
            # Si el objeto 'item' no tiene el atributo '_id' o si su valor es vacío, lo insertamos como un nuevo
            # documento
            _id = laColeccion.insert_one(item.__dict__)
            elId = _id.inserted_id.__str__()

        # Recuperamos el objeto 'item' recién guardado y lo transformamos para que su atributo '_id' sea una cadena
        x = laColeccion.find_one({"_id": ObjectId(elId)})
        x["_id"] = x["_id"].__str__()

        # Retornamos el objeto 'item' transformado
        return self.findById(elId)

    def delete(self, id):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Convertimos el ID proporcionado como argumento a un tipo ObjectId (utilizado por MongoDB)
        _id = ObjectId(id)

        # Utilizamos el método delete_one para eliminar el documento que coincide con el ID proporcionado La variable
        # 'cuenta' almacenará la cantidad de documentos eliminados (1 si se encontró y eliminó el documento,
        # 0 si no se encontró)
        cuenta = laColeccion.delete_one({"_id": _id}).deleted_count

        # Retornamos un diccionario con la cantidad de documentos eliminados
        return {"deleted_count": cuenta}

    def update(self, id, item: T):
        # Convertimos el ID proporcionado como argumento a un tipo ObjectId (utilizado por MongoDB)
        _id = ObjectId(id)

        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Eliminamos el atributo '_id' del objeto 'item' para que no se actualice en la base de datos
        delattr(item, "_id")

        # Convertimos 'item' a un diccionario para utilizarlo en la actualización de la base de datos
        item = item.__dict__

        # Creamos el diccionario de actualización con el operador $set
        updateItem = {"$set": item}

        # Realizamos la actualización en MongoDB utilizando el método update_one
        x = laColeccion.update_one({"_id": _id}, updateItem)

        # Retornamos un diccionario con la cantidad de documentos actualizados
        return {"updated_count": x.matched_count}

    def findById(self, id):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Convertimos el ID proporcionado como argumento a un tipo ObjectId (utilizado por MongoDB)
        _id = ObjectId(id)

        # Utilizamos el método find_one para buscar el documento con el ID proporcionado en la base de datos
        x = laColeccion.find_one({"_id": _id})

        # Llamamos al método 'getValuesDBRef' para transformar las referencias (DBRef) en el objeto 'x'
        x = self.getValuesDBRef(x)

        # Si no se encuentra el documento, 'x' será igual a None En ese caso, establecemos 'x' como un diccionario
        # vacío, de lo contrario, transformamos el valor del atributo '_id' a una cadena
        if x is None:
            x = {}
        else:
            x["_id"] = x["_id"].__str__()

        # Retornamos el documento encontrado o un diccionario vacío si no se encontró ningún documento con el ID
        # proporcionado
        return x

    def findAll(self):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Creamos una lista vacía para almacenar los documentos encontrados
        data = []

        # Utilizamos un bucle for para recorrer todos los documentos en la colección
        for x in laColeccion.find():
            # Transformamos el valor del atributo '_id' a una cadena utilizando el método __str__() para facilitar su
            # manejo
            x["_id"] = x["_id"].__str__()

            # Llamamos al método 'transformObjectIds' para transformar los ObjectIds en el objeto 'x'
            x = self.transformObjectIds(x)

            # Llamamos al método 'getValuesDBRef' para transformar las referencias (DBRef) en el objeto 'x'
            x = self.getValuesDBRef(x)

            # Agregamos el documento transformado a la lista 'data'
            data.append(x)

        # Retornamos la lista de documentos encontrados
        return data

    def query(self, theQuery):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Creamos una lista vacía para almacenar los documentos que coincidan con la consulta
        data = []

        # Utilizamos un bucle for para recorrer todos los documentos que coincidan con la consulta en la colección
        for x in laColeccion.find(theQuery):
            # Transformamos el valor del atributo '_id' a una cadena utilizando el método __str__() para facilitar su
            # manejo
            x["_id"] = x["_id"].__str__()

            # Llamamos al método 'transformObjectIds' para transformar los ObjectIds en el objeto 'x'
            x = self.transformObjectIds(x)

            # Llamamos al método 'getValuesDBRef' para transformar las referencias (DBRef) en el objeto 'x'
            x = self.getValuesDBRef(x)

            # Agregamos el documento transformado a la lista 'data'
            data.append(x)

        # Retornamos la lista de documentos encontrados que coincidan con la consulta
        return data

    def queryAggregation(self, theQuery):
        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado previamente en
        # 'self.coleccion'
        laColeccion = self.baseDatos[self.coleccion]

        # Creamos una lista vacía para almacenar los documentos que resulten de la consulta de agregación
        data = []

        # Utilizamos un bucle for para recorrer todos los documentos que resulten de la consulta de agregación en la
        # colección
        for x in laColeccion.aggregate(theQuery):
            # Transformamos el valor del atributo '_id' a una cadena utilizando el método __str__() para facilitar su
            # manejo
            x["_id"] = x["_id"].__str__()

            # Llamamos al método 'transformObjectIds' para transformar los ObjectIds en el objeto 'x'
            x = self.transformObjectIds(x)

            # Llamamos al método 'getValuesDBRef' para transformar las referencias (DBRef) en el objeto 'x'
            x = self.getValuesDBRef(x)

            # Agregamos el documento transformado a la lista 'data'
            data.append(x)

        # Retornamos la lista de documentos resultantes de la consulta de agregación
        return data

    def getValuesDBRef(self, x):
        # Obtenemos las claves del diccionario 'x'
        keys = x.keys()

        # Utilizamos un bucle for para recorrer todas las claves del diccionario
        for k in keys:
            # Si el valor asociado a la clave es una DBRef, realizamos una consulta en la base de datos
            if isinstance(x[k], DBRef):
                # Obtenemos la colección correspondiente a través del nombre de la colección almacenado en la DBRef
                laColeccion = self.baseDatos[x[k].collection]

                # Realizamos una consulta para obtener el documento referenciado por la DBRef utilizando su ID
                valor = laColeccion.find_one({"_id": ObjectId(x[k].id)})

                # Transformamos el valor del atributo '_id' del documento obtenido a una cadena utilizando el método
                # __str__()
                valor["_id"] = valor["_id"].__str__()

                # Reemplazamos el valor de la DBRef en el diccionario 'x' con el documento obtenido
                x[k] = valor

                # Llamamos recursivamente a 'getValuesDBRef' para manejar posibles referencias anidadas en el
                # documento obtenido
                x[k] = self.getValuesDBRef(x[k])

            # Si el valor asociado a la clave es una lista y tiene al menos un elemento, llamamos a
            # 'getValuesDBRefFromList'
            elif isinstance(x[k], list) and len(x[k]) > 0:
                x[k] = self.getValuesDBRefFromList(x[k])

            # Si el valor asociado a la clave es un diccionario, llamamos recursivamente a 'getValuesDBRef' para
            # manejar referencias anidadas
            elif isinstance(x[k], dict):
                x[k] = self.getValuesDBRef(x[k])

        # Retornamos el diccionario 'x' con los valores de las referencias manejadas
        return x

    def getValuesDBRefFromList(self, theList):
        # Creamos una lista vacía para almacenar los documentos referenciados transformados
        newList = []

        # Obtenemos la colección correspondiente a través del nombre de la colección almacenado en el primer elemento
        # de la lista
        laColeccion = self.baseDatos[theList[0]._id.collection]

        # Utilizamos un bucle for para recorrer todos los elementos de la lista
        for item in theList:
            # Realizamos una consulta para obtener el documento referenciado por la DBRef utilizando su ID
            value = laColeccion.find_one({"_id": ObjectId(item.id)})

            # Transformamos el valor del atributo '_id' del documento obtenido a una cadena utilizando el método
            # __str__()
            value["_id"] = value["_id"].__str__()

            # Agregamos el documento transformado a la nueva lista
            newList.append(value)

        # Retornamos la nueva lista con los documentos referenciados transformados
        return newList

    def transformObjectIds(self, x):
        # Utilizamos un bucle for para recorrer todas las claves (atributos) del diccionario 'x'
        for attribute in x.keys():
            # Si el valor asociado a la clave es un ObjectId, lo transformamos a una cadena utilizando el método
            # __str__()
            if isinstance(x[attribute], ObjectId):
                x[attribute] = x[attribute].__str__()

            # Si el valor asociado a la clave es una lista, llamamos a la función 'formatList' para transformar sus
            # elementos
            elif isinstance(x[attribute], list):
                x[attribute] = self.formatList(x[attribute])

            # Si el valor asociado a la clave es un diccionario, llamamos recursivamente a 'transformObjectIds' para
            # transformar los ObjectIds dentro del diccionario
            elif isinstance(x[attribute], dict):
                x[attribute] = self.transformObjectIds(x[attribute])

        # Retornamos el diccionario 'x' con los valores de los ObjectIds transformados a cadenas
        return x

    def formatList(self, x):
        # Creamos una lista vacía para almacenar los elementos transformados
        newList = []

        # Utilizamos un bucle for para recorrer todos los elementos de la lista 'x'
        for item in x:
            # Si el elemento es un ObjectId, lo transformamos a una cadena utilizando el método __str__()
            if isinstance(item, ObjectId):
                newList.append(item.__str__())

        # Si la lista 'newList' está vacía, significa que no había ObjectIds en la lista original 'x', por lo que
        # devolvemos 'x' sin cambios
        if len(newList) == 0:
            newList = x

        # Retornamos la nueva lista 'newList' con los ObjectIds transformados a cadenas, o la lista 'x' original si
        # no había ObjectIds
        return newList

    def transformRefs(self, item):
        # Obtenemos el diccionario de atributos de 'item'
        theDict = item.__dict__

        # Obtenemos una lista con todas las claves (nombres de atributos) del diccionario
        keys = list(theDict.keys())

        # Utilizamos un bucle for para recorrer todas las claves (atributos) del diccionario
        for k in keys:
            # Si el valor asociado a la clave es una referencia (DBRef), realizamos la transformación
            if theDict[k].__str__().count("object") == 1:
                # Llamamos a la función 'ObjectToDBRef' para transformar el objeto en un objeto DBRef
                newObject = self.ObjectToDBRef(getattr(item, k))

                # Reemplazamos el valor del atributo 'k' en 'item' con el objeto DBRef transformado
                setattr(item, k, newObject)

        # Retornamos el objeto 'item' con las referencias transformadas en objetos DBRef
        return item

    def ObjectToDBRef(self, item: T):
        # Obtenemos el nombre de la colección en la que se almacenarán los documentos del objeto 'item'
        nameCollection = item.__class__.__name__.lower()

        # Creamos un objeto DBRef utilizando el nombre de la colección y el ObjectId del objeto '_id' de 'item'
        return DBRef(nameCollection, ObjectId(item._id))