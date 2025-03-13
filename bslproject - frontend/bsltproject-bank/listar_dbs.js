// Script para listar todas las bases de datos en MongoDB
print("Bases de datos disponibles:");
db.adminCommand('listDatabases').databases.forEach(function(d) {
   print('- ' + d.name);
});
