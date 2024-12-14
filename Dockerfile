# Etapa de construcción
FROM node:20-alpine AS buildstage
WORKDIR /app

# Copiar los archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN npm run build -- --configuration production

# Etapa de producción
FROM nginx:alpine
# Copiar archivos compilados al directorio de Nginx
COPY --from=buildstage /app/dist/actividad-examen/browser /usr/share/nginx/html
# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exponer el puerto
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

#Contruir imagen:
    #docker build --no-cache -t jorgsanchezm/app_front:latest .
#Levantar contenedor:
    #docker run -d -p 80:80 --name app_front app_front
