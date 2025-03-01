package com.BsltProject.Servicios;

import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Repositorios.RepositorioPermisosRoles;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioRol;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PermisosRolesServicio {

    private final RepositorioPermisosRoles repositorioPermisosRoles;
    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;

    public PermisosRolesServicio(RepositorioPermisosRoles repositorioPermisosRoles,
                                 RepositorioRol repositorioRol,
                                 RepositorioPermiso repositorioPermiso) {
        this.repositorioPermisosRoles = repositorioPermisosRoles;
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
    }

    public PermisosRoles crearPermisosRoles(PermisosRoles permisosRoles) {
        return repositorioPermisosRoles.save(permisosRoles);
    }

    public List<PermisosRoles> obtenerTodosLosPermisosRoles() {
        return repositorioPermisosRoles.findAll();
    }

    public Optional<PermisosRoles> obtenerPermisosRolesPorId(String id) { // 🔹 Cambié Long por String
        return repositorioPermisosRoles.findById(id);
    }

    public PermisosRoles asignarPermisoARol(String rolId, String permisoId) { // 🔹 Cambié Long por String
        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Permiso permiso = repositorioPermiso.findById(permisoId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        PermisosRoles permisosRoles = new PermisosRoles();
        permisosRoles.setRol(rol);
        permisosRoles.setPermiso(permiso);

        return repositorioPermisosRoles.save(permisosRoles);
    }

    public void eliminarPermisosRoles(String id) { // 🔹 Cambié Long por String
        PermisosRoles permisosRoles = repositorioPermisosRoles.findById(id)
                .orElseThrow(() -> new RuntimeException("PermisosRoles no encontrado"));
        repositorioPermisosRoles.delete(permisosRoles);
    }
}
