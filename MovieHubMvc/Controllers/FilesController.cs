using Microsoft.AspNetCore.Mvc;
using MovieHubMvc.Models;

namespace MovieHubMvc.Controllers;

/// <summary>
/// Upload files to wwwroot/Files and list / preview them.
/// Themed for MovieHub: posters, screenshots, subtitles, etc.
/// </summary>
public class FilesController : Controller
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<FilesController> _logger;

    // Reasonable limits for student lab
    private const long MaxFileBytes = 10 * 1024 * 1024; // 10 MB
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
        ".pdf", ".txt", ".md", ".srt", ".vtt",
        ".mp4", ".webm",
        ".doc", ".docx", ".zip"
    };

    public FilesController(IWebHostEnvironment env, ILogger<FilesController> logger)
    {
        _env = env;
        _logger = logger;
    }

    private string FilesRoot => Path.Combine(_env.WebRootPath, "Files");

    private void EnsureFilesDir()
    {
        if (!Directory.Exists(FilesRoot))
            Directory.CreateDirectory(FilesRoot);
    }

    /// <summary>List all uploaded files + upload form.</summary>
    [HttpGet]
    public IActionResult Index()
    {
        EnsureFilesDir();
        var files = Directory.GetFiles(FilesRoot)
            .Select(path =>
            {
                var info = new FileInfo(path);
                return new FileItemViewModel
                {
                    Name = info.Name,
                    RelativePath = $"/Files/{info.Name}",
                    SizeBytes = info.Length,
                    UploadedAt = info.CreationTime,
                    Extension = info.Extension
                };
            })
            .OrderByDescending(f => f.UploadedAt)
            .ToList();

        ViewBag.Files = files;
        return View(new FileUploadViewModel());
    }

    /// <summary>Upload via Razor form (multipart).</summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(MaxFileBytes)]
    public async Task<IActionResult> Upload(FileUploadViewModel model)
    {
        EnsureFilesDir();

        if (model.File == null || model.File.Length == 0)
        {
            ModelState.AddModelError(nameof(model.File), "Please choose a file.");
            return IndexWithFiles(model);
        }

        if (model.File.Length > MaxFileBytes)
        {
            ModelState.AddModelError(nameof(model.File), "File is too large (max 10 MB).");
            return IndexWithFiles(model);
        }

        var ext = Path.GetExtension(model.File.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
        {
            ModelState.AddModelError(nameof(model.File),
                $"File type not allowed. Allowed: {string.Join(", ", AllowedExtensions)}");
            return IndexWithFiles(model);
        }

        // Safe file name: keep original base, strip path, avoid collisions
        var safeName = Path.GetFileName(model.File.FileName);
        safeName = string.Join("_", safeName.Split(Path.GetInvalidFileNameChars()));
        var destPath = Path.Combine(FilesRoot, safeName);

        if (System.IO.File.Exists(destPath))
        {
            var nameNoExt = Path.GetFileNameWithoutExtension(safeName);
            safeName = $"{nameNoExt}_{DateTime.Now:yyyyMMdd_HHmmss}{ext}";
            destPath = Path.Combine(FilesRoot, safeName);
        }

        try
        {
            await using var stream = new FileStream(destPath, FileMode.Create);
            await model.File.CopyToAsync(stream);
            _logger.LogInformation("Uploaded file {Name} ({Size} bytes)", safeName, model.File.Length);
            TempData["Success"] = $"File «{safeName}» uploaded successfully.";
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Upload failed");
            ModelState.AddModelError(string.Empty, $"Upload failed: {ex.Message}");
            return IndexWithFiles(model);
        }
    }

    /// <summary>Preview / details page for one file.</summary>
    [HttpGet]
    public IActionResult View(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return NotFound();

        // Prevent path traversal
        name = Path.GetFileName(name);
        var path = Path.Combine(FilesRoot, name);
        if (!System.IO.File.Exists(path))
            return NotFound();

        var info = new FileInfo(path);
        var model = new FileItemViewModel
        {
            Name = info.Name,
            RelativePath = $"/Files/{info.Name}",
            SizeBytes = info.Length,
            UploadedAt = info.CreationTime,
            Extension = info.Extension
        };

        // Optional: read small text files for inline preview
        var textExt = new[] { ".txt", ".md", ".srt", ".vtt", ".csv", ".json", ".xml", ".log" };
        if (textExt.Contains(info.Extension, StringComparer.OrdinalIgnoreCase) && info.Length < 200_000)
        {
            ViewBag.TextContent = System.IO.File.ReadAllText(path);
        }

        return View(model);
    }

    /// <summary>Force download.</summary>
    [HttpGet]
    public IActionResult Download(string name)
    {
        name = Path.GetFileName(name);
        var path = Path.Combine(FilesRoot, name);
        if (!System.IO.File.Exists(path))
            return NotFound();

        var contentType = "application/octet-stream";
        return PhysicalFile(path, contentType, name);
    }

    private IActionResult IndexWithFiles(FileUploadViewModel model)
    {
        EnsureFilesDir();
        var files = Directory.GetFiles(FilesRoot)
            .Select(path =>
            {
                var info = new FileInfo(path);
                return new FileItemViewModel
                {
                    Name = info.Name,
                    RelativePath = $"/Files/{info.Name}",
                    SizeBytes = info.Length,
                    UploadedAt = info.CreationTime,
                    Extension = info.Extension
                };
            })
            .OrderByDescending(f => f.UploadedAt)
            .ToList();
        ViewBag.Files = files;
        return View("Index", model);
    }
}
