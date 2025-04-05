package com.BsltProject.Controladores;


import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
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

    // Constructor con inyección de dependencia
    @Autowired
    public ControladorRol(RolServicio rolServicio) {
        this.rolServicio = rolServicio;
    }

    // CREAR ROL
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

    // OBTENER TODOS LOS ROLES
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        return ResponseEntity.ok(rolServicio.obtenerTodosLosRoles());
    }

    // OBTENER ROL POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable String id) {
        Optional<Rol> rol = rolServicio.obtenerRolPorId(id);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // OBTENER ROL POR NOMBRE
    @GetMapping("/name/{name}")
    public ResponseEntity<Rol> obtenerRolPorNombre(@PathVariable String name) {
        Optional<Rol> rol = rolServicio.obtenerRolPorNombre(name);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ACTUALIZAR ROL
    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(@PathVariable String id, @RequestBody Rol rolDetalles) {
        try {
            Rol rolActualizado = rolServicio.actualizarRol(id, rolDetalles);
            return ResponseEntity.ok(rolActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ELIMINAR ROL
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable String id) {
        try {
            rolServicio.eliminarRol(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // OBTENER USUARIOS CON UN ROL
    @GetMapping("/{id}/users")
    public ResponseEntity<List<Usuario>> obtenerUsuariosConRol(@PathVariable String id) {
        try {
            List<Usuario> usuarios = rolServicio.obtenerUsuariosConRol(id);
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            System.err.println("❌ Error al obtener usuarios: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}