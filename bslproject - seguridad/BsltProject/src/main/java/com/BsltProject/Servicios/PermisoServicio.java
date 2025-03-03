package com.BsltProject.Servicios;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Repositorios.RepositorioPermiso;

@Service
public class PermisoServicio {

    private final RepositorioPermiso repositorioPermiso;

    public PermisoServicio(RepositorioPermiso repositorioPermiso) {
        this.repositorioPermiso = repositorioPermiso;
    }

    public List<Permiso> obtenerTodosLosPermisos() {
        return repositorioPermiso.findAll();
    }

    public Optional<Permiso> obtenerPermisoPorId(String id) {
        return repositorioPermiso.findById(id);
    }

    public Optional<Permiso> obtenerPermisoPorNombre(String nombre) {
        return repositorioPermiso.findByNombre(nombre);
    }

    public Permiso crearPermiso(Permiso permiso) {
        return repositorioPermiso.save(permiso);
    }

    public Permiso actualizarPermiso(String id, Permiso permisoDetalles) {
        Permiso permiso = repositorioPermiso.findById(id)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        permiso.setNombre(permisoDetalles.getNombre());
        return repositorioPermiso.save(permiso);
    }

    public void eliminarPermiso(String id) {
        Permiso permiso = repositorioPermiso.findById(id)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        repositorioPermiso.delete(permiso);
    }
}
