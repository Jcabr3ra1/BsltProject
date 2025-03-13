package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Servicios.RolServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/seguridad/roles")
public class ControladorRol {

    private final RolServicio rolServicio;

    public ControladorRol(RolServicio rolServicio) {
        this.rolServicio = rolServicio;
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
        Rol rolActualizado = rolServicio.actualizarRol(id, rolDetalles);
        return ResponseEntity.ok(rolActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable String id) {
        rolServicio.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<List<Permiso>> obtenerPermisosDeRol(@PathVariable String id) {
        List<Permiso> permisos = rolServicio.obtenerPermisosDeRol(id);
        return ResponseEntity.ok(permisos);
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<Usuario>> obtenerUsuariosConRol(@PathVariable String id) {
        List<Usuario> usuarios = rolServicio.obtenerUsuariosConRol(id);
        return ResponseEntity.ok(usuarios);
    }
}
