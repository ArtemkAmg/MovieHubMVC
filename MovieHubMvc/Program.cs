using MovieHubMvc.Middleware;
using MovieHubMvc.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== File logging configuration (assignment: logs in Logs/ folder) =====
// Built-in logger + write to daily files under ContentRoot/Logs
var logsPath = Path.Combine(builder.Environment.ContentRootPath, "Logs");
Directory.CreateDirectory(logsPath);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddProvider(new MovieHubMvc.Logging.FileLoggerProvider(
    Path.Combine(logsPath, "app-{date}.log")));

builder.Services.AddControllersWithViews();

// Allow multipart uploads up to ~10 MB
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

// ===== Email configuration from appsettings.json =====
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Scoped — один екземпляр на HTTP-запит
builder.Services.AddScoped<IEmailSender, EmailSender>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Log every request: full URL + time + IP  →  Logs/requests-yyyy-MM-dd.log
app.UseRequestLogging();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
