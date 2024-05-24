using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Antiforgery;
using Dapper;
using System.Text.Json;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAntiforgery();

var app = builder.Build(); 

app.MapFallbackToFile("/index.html");
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAntiforgery();

var _connectionString = "Data Source=travelmania.db";

var connection = new SqliteConnection(_connectionString);

connection.Open();

app.MapPost("/testimonials", async (Testimonial testimonial) =>
{
    try
    {
        var sql = @"INSERT INTO Testimonials (Name, DestinationName, Rating, Review) 
                    VALUES (@Name, @DestinationName, @Rating, @Review)";
        await connection.ExecuteAsync(sql, testimonial);
        return Results.Ok();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapGet("/testimonials", async () =>
{
    try
    {
        var sql = @"SELECT * FROM Testimonials t";

        var testimonials = await connection.QueryAsync<Testimonial>(sql);

        return Results.Ok(testimonials);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});


app.MapDelete("/testimonials/{id}", async (int id) =>
{
    try
    {
        var sql = "DELETE FROM Testimonials WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });
        return Results.Ok(id);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapPut("/testimonials/{id}", async context =>
{
    try
    {
        string requestBody = await new System.IO.StreamReader(context.Request.Body).ReadToEndAsync();
        Testimonial? testimonial = JsonSerializer.Deserialize<Testimonial>(requestBody);

        var sql = $@"UPDATE Testimonials 
            SET Name = @Name, DestinationName = @DestinationName, Rating = @Rating, Review = @Review 
            WHERE Id = @Id";
        if (testimonial != null)
        {
            await connection.ExecuteAsync(sql, new { testimonial.Name, testimonial.DestinationName, testimonial.Rating, testimonial.Review, testimonial.Id });
        }
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync("Success");
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("Error occurred during processing.");
    }
});

app.Lifetime.ApplicationStopped.Register(() =>
{
    connection.Close();
});

app.Run();