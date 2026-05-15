package com.BsltProject.Controladores;


import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Servicios.RolServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/seguridad/roles")
public class ControladorRol {

    private final RolServicio rolServicio;
    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;

    
    @Autowired
    public ControladorRol(
            RolServicio rolServicio,
            RepositorioRol repositorioRol,
            RepositorioPermiso repositorioPermiso
    ) {
        this.rolServicio = rolServicio;
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
    }

    
    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            Rol nuevoRol = rolServicio.crearRol(rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear el rol", "detalle", e.getMessage()));
        }
    }

    
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        return ResponseEntity.ok(rolServicio.obtenerTodosLosRoles());
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable String id) {
        Optional<Rol> rol = rolServicio.obtenerRolPorId(id);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    @GetMapping("/name/{name}")
    public ResponseEntity<Rol> obtenerRolPorNombre(@PathVariable String name) {
        Optional<Rol> rol = rolServicio.obtenerRolPorNombre(name);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(@PathVariable String id, @RequestBody Rol rolDetalles) {
        try {
            Rol rolActualizado = rolServicio.actualizarRol(id, rolDetalles);
            return ResponseEntity.ok(rolActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable String id) {
        try {
            rolServicio.eliminarRol(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/permisos")
    public ResponseEntity<?> obtenerPermisosDelRol(@PathVariable String id) {
        try {

            
            Rol rol = repositorioRol.findById(id)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            
            List<Permiso> permisos = rolServicio.obtenerPermisosDeRol(id);

            

            return ResponseEntity.ok(permisos);
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "No se pudieron obtener los permisos",
                            "detalle", e.getMessage()
                    ));
        }

    }

    @PutMapping("/{roleId}/permisos/{permissionId}")
    public ResponseEntity<?> asignarPermisoARol(
            @PathVariable String roleId,
            @PathVariable String permissionId
    ) {
        try {
            

            
            Rol rol = repositorioRol.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Permiso permiso = repositorioPermiso.findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

            

            
            Rol rolActualizado = rolServicio.asignarPermiso(roleId, permissionId);

            
            return ResponseEntity.ok().body(Map.of(
                    "mensaje", "Permiso asignado exitosamente",
                    "rol", rolActualizado.getNombre(),
                    "permisos", rolActualizado.getPermisos().size()
            ));

        } catch (Exception e) {
            

            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "No se pudo asignar el permiso",
                            "tipo_error", e.getClass().getSimpleName(),
                            "detalle", e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/{roleId}/permisos/{permissionId}")
    public ResponseEntity<?> eliminarPermisoDeRol(
            @PathVariable String roleId,
            @PathVariable String permissionId
    ) {
        try {
            

            
            Rol rol = repositorioRol.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Permiso permiso = repositorioPermiso.findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

            

            
            Rol rolActualizado = rolServicio.eliminarPermiso(roleId, permissionId);

            
            return ResponseEntity.ok().body(Map.of(
                    "mensaje", "Permiso eliminado exitosamente",
                    "rol", rolActualizado.getNombre(),
                    "permisos_restantes", rolActualizado.getPermisos().size()
            ));

        } catch (Exception e) {
            

            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "No se pudo eliminar el permiso",
                            "tipo_error", e.getClass().getSimpleName(),
                            "detalle", e.getMessage()
                    ));
        }
    }

    
    @GetMapping("/{id}/users")
    public ResponseEntity<?> obtenerUsuariosConRol(@PathVariable String id) {
        try {
            
            Rol rol = repositorioRol.findById(id)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            List<Usuario> usuarios = rolServicio.obtenerUsuariosConRol(id);

            
            return ResponseEntity.ok(Map.of(
                    "rol", rol.getNombre(),
                    "usuarios", usuarios,
                    "total_usuarios", usuarios.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "No se pudieron obtener los usuarios",
                            "detalle", e.getMessage()
                    ));
        }
    }
}