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

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
        System.out.println("DEBUG - Datos de usuario recibidos para registro:");
        System.out.println("Email: " + usuario.getEmail());
        System.out.println("Nombre: " + usuario.getNombre());
        System.out.println("Apellido: " + usuario.getApellido());

        // Verificar si el email ya existe
        Optional<Usuario> usuarioExistente = repositorioUsuario.findByEmail(usuario.getEmail());
        if (usuarioExistente.isPresent()) {
            throw new RuntimeException("Ya existe un usuario registrado con ese correo electrónico.");
        }

        // Encriptar la contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        // Asignar rol por defecto
        if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            Optional<Rol> rolUser = repositorioRol.findByNombre("USER");
            rolUser.ifPresent(rol -> usuario.getRoles().add(rol));
        }

        // Asignar estado por defecto
        if (usuario.getEstado() == null) {
            Optional<Estado> estadoActivo = repositorioEstado.findByNombre("ACTIVO");
            estadoActivo.ifPresent(usuario::setEstado);
        }

        return repositorioUsuario.save(usuario);
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = repositorioUsuario.findAll();
        String backendFinancieroURL = "http://192.168.1.15:9999/finanzas/cuentas/"; // URL corregida
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
            String urlCuenta = "http://192.168.1.15:9999/finanzas/cuentas/" + usuario.getCuentaId();  // URL corregida
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
        usuario.setApellido(usuarioDetalles.getApellido()); // <- Ahora sí actualiza apellido
        usuario.setEmail(usuarioDetalles.getEmail());

        if (usuarioDetalles.getPassword() != null && !usuarioDetalles.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioDetalles.getPassword()));
        }

        // Actualizar Rol
        if (usuarioDetalles.getRoles() != null && !usuarioDetalles.getRoles().isEmpty()) {
            Set<Rol> nuevosRoles = new HashSet<>();
            for (Rol rol : usuarioDetalles.getRoles()) {
                Rol rolExistente = repositorioRol.findById(rol.getId())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rol.getId()));
                nuevosRoles.add(rolExistente);
            }
            usuario.setRoles(nuevosRoles);
        }

        // Actualizar Estado
        if (usuarioDetalles.getEstado() != null) {
            Estado estadoExistente = repositorioEstado.findById(usuarioDetalles.getEstado().getId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + usuarioDetalles.getEstado().getId()));
            usuario.setEstado(estadoExistente);
        }

        return repositorioUsuario.save(usuario);
    }

    public void desasociarCuenta(String userId, String cuentaId) {
        Optional<Usuario> optionalUsuario = repositorioUsuario.findById(userId);
        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();
            if (cuentaId.equals(usuario.getCuentaId())) {
                usuario.setCuentaId(null); // <--- aquí desasocias realmente
                repositorioUsuario.save(usuario);
            }
        } else {
            throw new RuntimeException("Usuario no encontrado para desasociar cuenta");
        }
    }
    public boolean eliminar(String idUsuario) {
        Optional<Usuario> optionalUsuario = repositorioUsuario.findById(idUsuario);

        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();

            // Si el usuario tiene una cuenta asociada, notifica al backend financiero
            if (usuario.getCuentaId() != null) {
                try {
                    String cuentaId = usuario.getCuentaId();
                    String urlFinanzas = "http://192.168.1.15:9999/finanzas/cuentas/" + cuentaId;

                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(urlFinanzas))
                            .DELETE()
                            .build();

                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                    System.out.println("Cuenta eliminada en Finanzas. Status: " + response.statusCode());
                } catch (Exception e) {
                    System.err.println("Error al eliminar cuenta del backend financiero: " + e.getMessage());
                }
            }

            // Finalmente elimina el usuario
            repositorioUsuario.deleteById(idUsuario);
            return true;
        }

        return false;
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

        // Verificación: ¿La cuenta ya está asignada a otro usuario?
        List<Usuario> todosUsuarios = repositorioUsuario.findAll();
        for (Usuario u : todosUsuarios) {
            if (cuentaId.equals(u.getCuentaId()) && !usuarioId.equals(u.getId())) {
                throw new RuntimeException("❌ La cuenta ya está asignada a otro usuario con ID: " + u.getId());
            }
        }

        // Buscar usuario por ID (con tolerancia)
        Optional<Usuario> usuarioOpt = repositorioUsuario.findById(usuarioId);

        if (!usuarioOpt.isPresent()) {
            // Búsqueda alternativa por coincidencia parcial
            for (Usuario u : todosUsuarios) {
                if (u.getId() != null &&
                        (u.getId().equalsIgnoreCase(usuarioId) ||
                                u.getId().contains(usuarioId) ||
                                usuarioId.contains(u.getId()))) {
                    usuarioOpt = Optional.of(u);
                    break;
                }
            }
        }

        if (!usuarioOpt.isPresent()) {
            throw new RuntimeException("❌ Usuario no encontrado con ID: " + usuarioId);
        }

        Usuario usuario = usuarioOpt.get();
        System.out.println("DEBUG - Usuario encontrado: " + usuario.getEmail());

        usuario.setCuentaId(cuentaId); // Asignar la cuenta
        Usuario usuarioActualizado = repositorioUsuario.save(usuario);
        System.out.println("✅ Cuenta asignada y usuario guardado");

        // Verificar persistencia
        Usuario usuarioVerificado = repositorioUsuario.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Error al verificar usuario"));

        if (usuarioVerificado.getCuentaId() == null || !usuarioVerificado.getCuentaId().equals(cuentaId)) {
            throw new RuntimeException("❌ Error al asignar cuenta en Seguridad");
        }

        return usuarioActualizado;
    }

}
