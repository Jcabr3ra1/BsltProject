package com.BsltProject.Modelos;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Document(collection = "usuarios") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    private String id; 

    private String email;
    private String nombre;
    private String apellido; 
    private String password;

    private String cuentaId; 

    @Transient 
    private Map<String, Object> cuenta; 

    @DBRef 
    private Set<Rol> roles = new HashSet<>();

    @JsonInclude(JsonInclude.Include.NON_EMPTY) 
    @DBRef 
    private Set<Permiso> permisos;

    @DBRef 
    private Estado estado;
}
