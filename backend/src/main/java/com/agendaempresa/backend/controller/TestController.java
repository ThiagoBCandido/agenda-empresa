package com.agendaempresa.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "Back-end funcionando!";
    }

    @PostMapping("/validation")
    public String validate(@Valid @RequestBody TestRequest request) {
        return "Nome recebido com sucesso: " + request.name();
    }

    public record TestRequest(
            @NotBlank(message = "O nome é obrigatório")
            @Size(min = 3, max = 50, message = "O nome deve ter entre 3 e 50 caracteres")
            String name
        ) {}
}