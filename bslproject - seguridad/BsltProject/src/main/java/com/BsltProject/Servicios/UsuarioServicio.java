package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Estado;
import com.BsltProject.Modelos.Permiso; // Agregado para manejar permisos
import com.BsltProject.Repositorios.RepositorioUsuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioEstado;
import com.BsltProject.Repositorios.RepositorioPermiso; // Agregado para manejar permisos
import com.BsltProject.Seguridad.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UsuarioServicio {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioRol repositorioRol;
    private final RepositorioEstado repositorioEstado;
    private final RepositorioPermiso repositorioPermiso; // Agregado para manejar permisos
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UsuarioServicio(RepositorioUsuario repositorioUsuario,
                           RepositorioRol repositorioRol,
                           RepositorioEstado repositorioEstado,
                           RepositorioPermiso repositorioPermiso, // Agregado en el constructor
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioRol = repositorioRol;
        this.repositorioEstado = repositorioEstado;
        this.repositorioPermiso = repositorioPermiso; // Guardamos referencia del repositorio de permisos
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Usuario crearUsuario(Usuario usuario) {
        // Añadir logs para depuración
        System.out.println("DEBUG - Datos de usuario recibidos para registro:");
        System.out.println("Email: " + usuario.getEmail());
        System.out.println("Nombre: " + usuario.getNombre());
        System.out.println("Apellido: " + usuario.getApellido());
        
        // Encripta la contraseña antes de guardarla
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        
        // Asignar rol USER por defecto si no tiene roles asignados
        if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            Optional<Rol> rolUser = repositorioRol.findByNombre("USER");
            if (rolUser.isPresent()) {
                if (usuario.getRoles() == null) {
                    usuario.setRoles(new HashSet<>());
                }
                usuario.getRoles().add(rolUser.get());
            }
        }
        
        // Asignar estado ACTIVO por defecto
        if (usuario.getEstado() == null) {
            Optional<Estado> estadoActivo = repositorioEstado.findByNombre("ACTIVO");
            if (estadoActivo.isPresent()) {
                usuario.setEstado(estadoActivo.get());
            }
        }
        
        return repositorioUsuario.save(usuario);
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = repositorioUsuario.findAll();
        String backendFinancieroURL = "http://localhost:9999/finanzas/cuentas/"; // URL corregida
        RestTemplate restTemplate = new RestTemplate();

        // Usamos parallelStream() para mejorar el rendimiento
        usuarios.parallelStream().forEach(usuario -> {
            if (usuario.getCuentaId() != null && !usuario.getCuentaId().isEmpty()) {
                try {
                    ResponseEntity<Map> respuesta = restTemplate.getForEntity(backendFinancieroURL + usuario.getCuentaId(), Map.class);

                    if (respuesta.getStatusCode().is2xxSuccessful() && respuesta.getBody() != null) {
                        usuario.setCuenta(respuesta.getBody()); // Agregamos la cuenta en la respuesta
                    } else {
                        usuario.setCuenta(Map.of("error", "Cuenta no encontrada"));
                    }
                } catch (Exception e) {
                    usuario.setCuenta(Map.of("error", "No se pudo conectar con Finanzas"));
                }
            } else {
                usuario.setCuenta(Map.of("mensaje", "El usuario no tiene una cuenta asignada"));
            }
        });

        return usuarios;
    }

    public Optional<Usuario> obtenerUsuarioPorId(String usuarioId) {
        Optional<Usuario> usuarioOptional = repositorioUsuario.findById(usuarioId);
        if (!usuarioOptional.isPresent()) {
            return Optional.empty();
        }

        Usuario usuario = usuarioOptional.get();

        // Verificar si el usuario tiene una cuenta asignada
        if (usuario.getCuentaId() != null && !usuario.getCuentaId().isEmpty()) {
            String urlCuenta = "http://localhost:9999/finanzas/cuentas/" + usuario.getCuentaId();  // URL corregida
            RestTemplate restTemplate = new RestTemplate();

            try {
                System.out.println("Consultando Finanzas en: " + urlCuenta); // Mensaje de depuración

                ResponseEntity<Map> respuesta = restTemplate.getForEntity(urlCuenta, Map.class);

                if (respuesta.getStatusCode().is2xxSuccessful()) {
                    usuario.setCuenta(respuesta.getBody()); // Asignar datos de la cuenta
                } else {
                    usuario.setCuenta(Map.of("error", "No se pudo obtener la cuenta"));
                }
            } catch (Exception e) {
                System.err.println("Error conectando con Finanzas: " + e.getMessage()); // Mostrar error en consola
                usuario.setCuenta(Map.of("error", "No se pudo conectar con Finanzas"));
            }
        } else {
            usuario.setCuenta(Map.of("mensaje", "El usuario no tiene una cuenta asignada"));
        }

        return Optional.of(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return repositorioUsuario.findByEmail(email);
    }

    public Usuario actualizarUsuario(String id, Usuario usuarioDetalles) {
        Usuario usuario = repositorioUsuario.findById(String.valueOf(id))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDetalles.getNombre());
        usuario.setEmail(usuarioDetalles.getEmail());

        if (usuarioDetalles.getPassword() != null && !usuarioDetalles.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioDetalles.getPassword()));
        }

        return repositorioUsuario.save(usuario);
    }

    public void eliminarUsuario(String id) {
        Usuario usuario = repositorioUsuario.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        repositorioUsuario.delete(usuario);
    }

    public Usuario asignarRol(String usuarioId, String rolId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Crear un nuevo conjunto de roles y agregar solo el nuevo rol
        Set<Rol> nuevosRoles = new HashSet<>();
        nuevosRoles.add(rol);

        // Reemplazar completamente la colección de roles
        usuario.setRoles(nuevosRoles);

        usuario = repositorioUsuario.save(usuario);

        // Regenerar el token con los nuevos roles
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).collect(Collectors.toList());
        String nuevoToken = jwtUtil.generarToken(usuario.getEmail(), roles);

        System.out.println("Nuevo token con roles actualizado: " + nuevoToken);

        return usuario;
    }


    public Usuario asignarEstado(String usuarioId, String estadoId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Estado estado = repositorioEstado.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        usuario.setEstado(estado); // Asigna el estado al usuario
        return repositorioUsuario.save(usuario);
    }

    public Usuario asignarCuentaAUsuario(String usuarioId, String cuentaId) {
        System.out.println("DEBUG - Servicio: Iniciando asignación de cuenta " + cuentaId + " a usuario " + usuarioId);
        
        // Listar todos los usuarios para depuración
        List<Usuario> todosUsuarios = repositorioUsuario.findAll();
        System.out.println("DEBUG - Servicio: Total de usuarios en la base de datos: " + todosUsuarios.size());
        for (Usuario u : todosUsuarios) {
            System.out.println("DEBUG - Usuario encontrado: ID=" + u.getId() + ", Email=" + u.getEmail());
        }
        
        // Intentar encontrar el usuario por ID
        Optional<Usuario> usuarioOpt = repositorioUsuario.findById(usuarioId);
        
        if (!usuarioOpt.isPresent()) {
            System.out.println("DEBUG - Servicio: Usuario no encontrado por ID, intentando buscar por otros medios...");
            
            // Si no se encuentra por ID, buscar el usuario que tenga un ID similar
            // (puede haber diferencias en formato o mayúsculas/minúsculas)
            for (Usuario u : todosUsuarios) {
                if (u.getId() != null && 
                    (u.getId().equals(usuarioId) || 
                     u.getId().toLowerCase().equals(usuarioId.toLowerCase()) ||
                     u.getId().contains(usuarioId) || 
                     usuarioId.contains(u.getId()))) {
                    
                    System.out.println("DEBUG - Servicio: Usuario encontrado por coincidencia parcial de ID: " + u.getId());
                    usuarioOpt = Optional.of(u);
                    break;
                }
            }
            
            // Si aún no se encuentra, podríamos intentar buscar por email si tenemos esa información
            // (esto requeriría modificar la API para pasar el email como parámetro adicional)
        }
        
        if (!usuarioOpt.isPresent()) {
            throw new RuntimeException("Usuario no encontrado con ID: " + usuarioId);
        }
        
        Usuario usuario = usuarioOpt.get();
        System.out.println("DEBUG - Servicio: Usuario encontrado: " + usuario.getEmail());
        System.out.println("DEBUG - Servicio: CuentaId actual: " + usuario.getCuentaId());

        usuario.setCuentaId(cuentaId); // Guardar en la base de datos
        System.out.println("DEBUG - Servicio: Nuevo cuentaId asignado: " + cuentaId);
        
        Usuario usuarioActualizado = repositorioUsuario.save(usuario);
        System.out.println("DEBUG - Servicio: Usuario guardado en la base de datos");

        // Verificar si realmente se guardó en la base de datos
        Usuario usuarioVerificado = repositorioUsuario.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Error al verificar usuario"));
        
        System.out.println("DEBUG - Servicio: Usuario verificado, cuentaId: " + usuarioVerificado.getCuentaId());

        if (usuarioVerificado.getCuentaId() == null) {
            System.err.println("ERROR - Servicio: La cuenta no se asignó correctamente en la base de datos");
            throw new RuntimeException("Error al asignar cuenta en Seguridad");
        }

        return usuarioActualizado;  // Devuelve usuario actualizado con cuentaId
    }
}
