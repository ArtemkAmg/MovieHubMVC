using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MovieHubMvc.Models;

public class FileUploadViewModel
{
    [Required(ErrorMessage = "Please choose a file")]
    [Display(Name = "File")]
    public IFormFile? File { get; set; }

    [StringLength(200)]
    [Display(Name = "Description (optional)")]
    public string? Description { get; set; }
}

public class FileItemViewModel
{
    public string Name { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public string Extension { get; set; } = string.Empty;

    public string SizeDisplay =>
        SizeBytes < 1024 ? $"{SizeBytes} B" :
        SizeBytes < 1024 * 1024 ? $"{SizeBytes / 1024.0:F1} KB" :
        $"{SizeBytes / (1024.0 * 1024.0):F1} MB";
}
