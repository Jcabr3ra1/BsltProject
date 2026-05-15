package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RolServicio {

    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;
    private final RepositorioUsuario repositorioUsuario;

    @Autowired
    public RolServicio(RepositorioRol repositorioRol, RepositorioPermiso repositorioPermiso, RepositorioUsuario repositorioUsuario) {
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
        this.repositorioUsuario = repositorioUsuario;
    }

    public Rol crearRol(Rol rol) {
        return repositorioRol.save(rol);
    }

    public List<Rol> obtenerTodosLosRoles() {
        return repositorioRol.findAll();
    }

    public Optional<Rol> obtenerRolPorId(String id) {
        
        if (id == null || id.trim().isEmpty()) {
            return Optional.empty();
        }

        return repositorioRol.findById(id);
    }

    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return repositorioRol.findByNombre(nombre);
    }

    public Rol actualizarRol(String id, Rol rolDetalles) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolDetalles.getNombre());

        
        if (rolDetalles.getPermisos() != null && !rolDetalles.getPermisos().isEmpty()) {
            rol.setPermisos(rolDetalles.getPermisos());
        }

        return repositorioRol.save(rol);
    }

    public void eliminarRol(String id) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        repositorioRol.delete(rol);
    }

    public List<Permiso> obtenerPermisosDeRol(String id) {
        

        
        if (!esIdValido(id)) {
            return Collections.emptyList();
        }

        try {
            
            Optional<Rol> rolOptional = repositorioRol.findById(id);

            
            if (!rolOptional.isPresent()) {
                return Collections.emptyList();
            }

            
            Rol rol = rolOptional.get();

            
            List<Permiso> permisos = rol.getPermisos();
            if (permisos == null) {
                return new ArrayList<>();
            }

            
            List<Permiso> permisosValidos = permisos.stream()
                    .filter(p -> p != null)
                    .collect(Collectors.toList());

            return permisosValidos;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public Rol asignarPermiso(String roleId, String permissionId) {
        
        Rol rol = repositorioRol.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        
        Permiso permiso = repositorioPermiso.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        
        rol.agregarPermiso(permiso);

        
        return repositorioRol.save(rol);
    }

    public Rol eliminarPermiso(String roleId, String permissionId) {
        
        Rol rol = repositorioRol.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        
        Permiso permiso = repositorioPermiso.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        
        rol.eliminarPermisoPorId(permissionId);

        
        return repositorioRol.save(rol);
    }



    public List<Usuario> obtenerUsuariosConRol(String id) {
        return repositorioUsuario.findByRolesId(id);
    }

    public List<String> obtenerPermisosPorRol(String nombreRol) {
        Optional<Rol> rol = repositorioRol.findByNombre(nombreRol);

        if (rol.isEmpty()) {
            return List.of();
        }

        List<String> permisos = rol.get().getPermisos().stream()
                .map(Permiso::getNombre)
                .collect(Collectors.toList());

        return permisos;
    }

    
    private boolean esIdValido(String id) {
        if (id == null || id.trim().isEmpty()) {
            return false;
        }

        
        String patronHex = "^[0-9a-fA-F]{24}$";

        return id.matches(patronHex);
    }
}