package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "estados") // 🔹 Definirlo como una colección en MongoDB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Estado {

    @Id
    private String id; // 🔹 Cambié Long por String

    private String nombre;
}
