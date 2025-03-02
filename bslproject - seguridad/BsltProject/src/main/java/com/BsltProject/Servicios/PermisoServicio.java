package com.BsltProject.Servicios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Repositorios.RepositorioPermiso;

@Service
public class PermisoServicio {

    @Autowired
    private RepositorioPermiso repositorioPermiso;

    public List<Permiso> obtenerTodos() {
        return repositorioPermiso.findAll();
    }

    public Permiso obtenerPorNombre(String nombre) {
        return repositorioPermiso.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("❌ Error: No se encontró el permiso con nombre: " + nombre));
    }


    public Permiso crearPermiso(Permiso permiso) {
        if (permiso.getDescripcion() == null || permiso.getDescripcion().isEmpty()) {
            throw new RuntimeException("La descripción no puede estar vacía");
        }
        return repositorioPermiso.save(permiso);
    }

    public void eliminarPermiso(String id) {
        repositorioPermiso.deleteById(id);
    }
}
