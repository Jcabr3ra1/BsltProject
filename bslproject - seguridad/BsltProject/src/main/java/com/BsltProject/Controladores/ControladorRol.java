package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Servicios.RolServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/roles")
public class ControladorRol {

    private final RolServicio rolServicio;

    public ControladorRol(RolServicio rolServicio) {
        this.rolServicio = rolServicio;
    }

    @PostMapping
    public ResponseEntity<Rol> crearRol(@RequestBody Rol rol) {
        return ResponseEntity.ok(rolServicio.crearRol(rol));
    }

    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        return ResponseEntity.ok(rolServicio.obtenerTodosLosRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable String id) { // 🔹 Cambié Long por String
        Optional<Rol> rol = rolServicio.obtenerRolPorId(id);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Rol> obtenerRolPorNombre(@PathVariable String nombre) {
        Optional<Rol> rol = rolServicio.obtenerRolPorNombre(nombre);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(@PathVariable String id, @RequestBody Rol rolDetalles) { // 🔹 Cambié Long por String
        Rol rolActualizado = rolServicio.actualizarRol(id, rolDetalles);
        return ResponseEntity.ok(rolActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable String id) { // 🔹 Cambié Long por String
        rolServicio.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }
}
