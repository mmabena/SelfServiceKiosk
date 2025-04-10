using Microsoft.EntityFrameworkCore;
using api.Data; // Your ApplicationDBContext
//using Swashbuckle.AspNetCore.SwaggerUI; // Required for Swagger UI
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();  // Add endpoints API explorer
builder.Services.AddSwaggerGen();  // Add Swagger generation service
builder.Services.AddControllers();

// Corrected connection string
builder.Services.AddDbContext<ApplicationDBContext>(options => 

    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

//
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();  // Use Swagger middleware to generate API documentation
    app.UseSwaggerUI();  // Use Swagger UI to display the API documentation
}

/* void ConfigureServices(IServiceCollection services)
{
    // Add Identity services
    services.AddIdentity<User, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDBContext>()
        .AddDefaultTokenProviders();

    // Add Authentication and Cookie Middleware
    services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(options =>
        {
            options.LoginPath = "/api/user/login";  // Customize login path if needed
            options.LogoutPath = "/api/user/logout"; // Customize logout path
        });

    services.AddControllers();
}

*/
app.UseHttpsRedirection();


app.MapControllers();

app.Run();
 