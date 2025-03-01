package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Servicios.PermisoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permisos")
public class ControladorPermiso {

    @Autowired
    private PermisoServicio permisoServicio;

    @GetMapping
    public List<Permiso> obtenerTodos() {
        return permisoServicio.obtenerTodos();
    }

    @PostMapping
    public Permiso crearPermiso(@RequestBody Permiso permiso) {
        return permisoServicio.crearPermiso(permiso);
    }

    @DeleteMapping("/{id}")
    public void eliminarPermiso(@PathVariable String id) {
        permisoServicio.eliminarPermiso(id);
    }
}
