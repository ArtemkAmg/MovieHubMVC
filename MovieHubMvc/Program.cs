using System.Globalization;
using FluentValidation;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Localization;
using MovieHubMvc.Localization;
using MovieHubMvc.Middleware;
using MovieHubMvc.Services;
using MovieHubMvc.Validators;

var builder = WebApplication.CreateBuilder(args);

// ===== File logging =====
var logsPath = Path.Combine(builder.Environment.ContentRootPath, "Logs");
Directory.CreateDirectory(logsPath);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddProvider(new MovieHubMvc.Logging.FileLoggerProvider(
    Path.Combine(logsPath, "app-{date}.log")));

// ===== Localization (shared JSON resources in /Resources) =====
// JSON instead of .resx — avoids embedding issues; still "shared resources"
builder.Services.AddSingleton<IStringLocalizerFactory, JsonStringLocalizerFactory>();
builder.Services.AddTransient(typeof(IStringLocalizer<>), typeof(StringLocalizer<>));

builder.Services.AddLocalization();

builder.Services.AddControllersWithViews()
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();

builder.Services.AddValidatorsFromAssemblyContaining<MovieSuggestionValidator>();

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supported = new[]
    {
        new CultureInfo("en"),
        new CultureInfo("uk")
    };
    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = supported;
    options.SupportedUICultures = supported;
    options.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider());
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailSender, EmailSender>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRequestLocalization();

app.UseRequestLogging();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
