package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Repositorios.RepositorioRol;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolServicio {

    private final RepositorioRol repositorioRol;

    public RolServicio(RepositorioRol repositorioRol) {
        this.repositorioRol = repositorioRol;
    }

    public Rol crearRol(Rol rol) {
        return repositorioRol.save(rol);
    }

    public List<Rol> obtenerTodosLosRoles() {
        return repositorioRol.findAll();
    }

    public Optional<Rol> obtenerRolPorId(String id) { // 🔹 Cambié Long por String
        return repositorioRol.findById(id);
    }

    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return repositorioRol.findByNombre(nombre);
    }

    public Rol actualizarRol(String id, Rol rolDetalles) { // 🔹 Cambié Long por String
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolDetalles.getNombre());

        return repositorioRol.save(rol);
    }

    public void eliminarRol(String id) { // 🔹 Cambié Long por String
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        repositorioRol.delete(rol);
    }
}
