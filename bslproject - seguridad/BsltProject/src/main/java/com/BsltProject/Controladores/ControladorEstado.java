package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Estado;
import com.BsltProject.Servicios.EstadoServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/seguridad/estados")
public class ControladorEstado {

    private final EstadoServicio estadoServicio;

    public ControladorEstado(EstadoServicio estadoServicio) {
        this.estadoServicio = estadoServicio;
    }

    // ✅ OBTENER TODOS LOS ESTADOS
    @GetMapping
    public ResponseEntity<List<Estado>> obtenerTodosLosEstados() {
        return ResponseEntity.ok(estadoServicio.obtenerTodosLosEstados());
    }

    // ✅ OBTENER UN ESTADO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Estado> obtenerEstadoPorId(@PathVariable String id) {
        Optional<Estado> estado = estadoServicio.obtenerEstadoPorId(id);
        return estado.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ CREAR UN NUEVO ESTADO
    @PostMapping
    public ResponseEntity<Estado> crearEstado(@RequestBody Estado estado) {
        return ResponseEntity.ok(estadoServicio.crearEstado(estado));
    }

    // ✅ ACTUALIZAR UN ESTADO
    @PutMapping("/{id}")
    public ResponseEntity<Estado> actualizarEstado(@PathVariable String id, @RequestBody Estado estadoDetalles) {
        Estado estadoActualizado = estadoServicio.actualizarEstado(id, estadoDetalles);
        return ResponseEntity.ok(estadoActualizado);
    }

    // ✅ ELIMINAR UN ESTADO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEstado(@PathVariable String id) {
        estadoServicio.eliminarEstado(id);
        return ResponseEntity.noContent().build();
    }
}
