use std::process::{Command, Stdio};
use std::thread;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _app_handle = app.handle().clone();

            // Ejecutar el backend de Flask en un hilo separado
            thread::spawn(|| {
                let _ = Command::new("python3")
                .args(&["/home/rodrigo-pc/Escritorio/Proyectos/EVVO/gym_management/venv/gym-management-backend/app/app.py"])
                .stdout(Stdio::inherit())
                    .stderr(Stdio::inherit())

                    .spawn()
                    .expect("No se pudo iniciar el servidor Flask");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error al ejecutar la aplicación Tauri");
}