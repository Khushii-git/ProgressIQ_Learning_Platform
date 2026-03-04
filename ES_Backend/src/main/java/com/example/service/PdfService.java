package com.example.service;

import com.example.entity.Content;
import com.example.entity.StudentContentProgress;
import com.example.entity.TeacherStudentMapping;
import com.example.entity.User;
import com.example.repository.ContentRepository;
import com.example.repository.ProgressRepository;
import com.example.repository.TeacherStudentRepository;
import com.example.repository.UserRepository;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.CategoryChart;
import org.knowm.xchart.CategoryChartBuilder;
import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieChartBuilder;
import org.knowm.xchart.internal.chartpart.Chart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PdfService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private TeacherStudentRepository teacherStudentRepository;

    @Autowired
    private ContentRepository contentRepository;

    /**
     * Generate PDF report for student progress
     */
    public String generateProgressReport(Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() == User.Role.TEACHER) {
                return createTeacherReport(user, false);
            }
            return createStudentReport(user, false);

        } catch (Exception e) {
            System.out.println("✗ PDF generation failed: " + e.getMessage());
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage());
        }
    }

    /**
     * Generate PDF report with detailed analytics
     */
    public String generateDetailedReport(Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() == User.Role.TEACHER) {
                return createTeacherReport(user, true);
            }
            return createStudentReport(user, true);

        } catch (Exception e) {
            System.out.println("✗ PDF generation failed: " + e.getMessage());
            throw new RuntimeException("Failed to generate detailed report: " + e.getMessage());
        }
    }

    private String createStudentReport(User student, boolean detailed) throws Exception {
        List<StudentContentProgress> progressList = progressRepository.findByStudent(student);

        String prefix = detailed ? "detailed_student_" : "student_summary_";
        String fileName = "reports/" + prefix + student.getUsername() + "_" + System.currentTimeMillis() + ".pdf";
        ensureReportsDirectory();

        try (PdfWriter writer = new PdfWriter(fileName);
             PdfDocument pdfDocument = new PdfDocument(writer);
             Document document = new Document(pdfDocument)) {

            document.add(new Paragraph(detailed ? "Detailed Learning Analytics Report" : "Student Progress Snapshot")
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\nStudent: " + student.getUsername() + " (" + student.getEmail() + ")"));
            document.add(new Paragraph("Generated: " + new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(new Date())));

            long completedCount = progressList.stream().filter(StudentContentProgress::isCompleted).count();
            long inProgressCount = progressList.size() - completedCount;

            document.add(new Paragraph("\nOverview").setBold().setFontSize(14));
            document.add(new Paragraph("Total Items: " + progressList.size()));
            document.add(new Paragraph("Completed: " + completedCount));
            document.add(new Paragraph("In Progress: " + Math.max(inProgressCount, 0)));
            document.add(new Paragraph("Completion Rate: " + (progressList.isEmpty() ? 0 :
                    String.format("%.2f", (completedCount * 100.0 / progressList.size())) + "%")));

            if (!progressList.isEmpty()) {
                document.add(new Paragraph("\nVisual Insights").setBold().setFontSize(14));
                Image completionChart = buildCompletionChart(completedCount, inProgressCount, "Completion Overview");
                if (completionChart != null) {
                    document.add(completionChart);
                }

                Map<String, Long> typeBreakdown = progressList.stream()
                        .collect(Collectors.groupingBy(p -> p.getContent().getContentType().name(), Collectors.counting()));
                Image typeChart = buildContentPieChart("Content Type Mix", typeBreakdown);
                if (typeChart != null) {
                    document.add(typeChart);
                }
            }

            if (detailed && !progressList.isEmpty()) {
                document.add(new Paragraph("\nDetailed Progress Log").setBold().setFontSize(14));
                Table table = new Table(5);
                table.addHeaderCell("S.No");
                table.addHeaderCell("Content");
                table.addHeaderCell("Type");
                table.addHeaderCell("Status");
                table.addHeaderCell("Completed On");

                int count = 1;
                for (StudentContentProgress progress : progressList) {
                    table.addCell(String.valueOf(count++));
                    table.addCell(progress.getContent().getTitle());
                    table.addCell(progress.getContent().getContentType().toString());
                    table.addCell(progress.isCompleted() ? "Completed" : "In Progress");
                    table.addCell(progress.getCompletedAt() != null ? progress.getCompletedAt().toString() : "-");
                }

                document.add(table);

                document.add(new Paragraph("\nRecommendations").setBold().setFontSize(14));
                if (inProgressCount > 0) {
                    document.add(new Paragraph("• You have " + inProgressCount + " pending item(s). Complete them to stay on track."));
                }
                if (progressList.size() < 5) {
                    document.add(new Paragraph("• Try exploring more content to diversify learning."));
                } else {
                    document.add(new Paragraph("• Great job maintaining consistency!"));
                }
            }
        }

        System.out.println("✓ Student PDF generated: " + fileName);
        return fileName;
    }

    private String createTeacherReport(User teacher, boolean detailed) throws Exception {
        List<User> students = teacherStudentRepository.findByTeacher(teacher).stream()
                .map(TeacherStudentMapping::getStudent)
                .collect(Collectors.toList());

        List<Content> teacherContent = contentRepository.findByUploadedByAndIsPersonalFalse(teacher);

        List<StudentSnapshot> studentSnapshots = new ArrayList<>();
        for (User student : students) {
            List<StudentContentProgress> progress = progressRepository.findByStudent(student);
            long completed = progress.stream().filter(StudentContentProgress::isCompleted).count();
            long total = progress.size();
            double percentage = total == 0 ? 0 : (completed * 100.0) / total;
            studentSnapshots.add(new StudentSnapshot(student.getUsername(), student.getEmail(), percentage, completed, total));
        }

        Map<String, Long> typeBreakdown = teacherContent.stream()
                .collect(Collectors.groupingBy(c -> c.getContentType().name(), Collectors.counting()));

        Map<String, Long> performanceBuckets = new LinkedHashMap<>();
        long high = studentSnapshots.stream().filter(s -> s.percentage() >= 75).count();
        long medium = studentSnapshots.stream().filter(s -> s.percentage() >= 50 && s.percentage() < 75).count();
        long low = studentSnapshots.stream().filter(s -> s.percentage() < 50).count();
        performanceBuckets.put("High (75%+)", high);
        performanceBuckets.put("Moderate (50-74%)", medium);
        performanceBuckets.put("Needs Attention (<50%)", low);

        Map<String, Long> contentCompletion = teacherContent.stream()
            .collect(Collectors.toMap(
                content -> content.getTitle() + " (#" + content.getId() + ")",
                content -> progressRepository.countByContentAndCompletedTrue(content),
                Long::sum,
                LinkedHashMap::new));

        String prefix = detailed ? "teacher_detailed_" : "teacher_summary_";
        String fileName = "reports/" + prefix + teacher.getUsername() + "_" + System.currentTimeMillis() + ".pdf";
        ensureReportsDirectory();

        try (PdfWriter writer = new PdfWriter(fileName);
             PdfDocument pdfDocument = new PdfDocument(writer);
             Document document = new Document(pdfDocument)) {

            document.add(new Paragraph(detailed ? "Teacher Analytics Report" : "Teacher Dashboard Snapshot")
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\nTeacher: " + teacher.getUsername() + " (" + teacher.getEmail() + ")"));
            document.add(new Paragraph("Generated: " + new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(new Date())));

            document.add(new Paragraph("\nOverview").setBold().setFontSize(14));
            document.add(new Paragraph("Students Assigned: " + students.size()));
            document.add(new Paragraph("Shared Materials: " + teacherContent.size()));
            double avgProgress = studentSnapshots.isEmpty() ? 0 : studentSnapshots.stream().mapToDouble(StudentSnapshot::percentage).average().orElse(0);
            document.add(new Paragraph("Average Student Progress: " + String.format("%.2f%%", avgProgress)));

            if (!studentSnapshots.isEmpty()) {
                document.add(new Paragraph("\nVisual Insights").setBold().setFontSize(14));
                Image performanceChart = buildContentPieChart("Student Performance", performanceBuckets);
                if (performanceChart != null) {
                    document.add(performanceChart);
                }

                List<StudentSnapshot> topStudents = studentSnapshots.stream()
                        .sorted(Comparator.comparingDouble(StudentSnapshot::percentage).reversed())
                        .limit(8)
                        .collect(Collectors.toList());

                List<String> labels = topStudents.stream().map(StudentSnapshot::name).collect(Collectors.toList());
                List<Number> values = topStudents.stream().map(StudentSnapshot::percentage).collect(Collectors.toList());
                Image studentChart = buildBarChart("Top Student Progress", "Students", "Progress %", labels, values, true);
                if (studentChart != null) {
                    document.add(studentChart);
                }
            }

            if (!contentCompletion.isEmpty()) {
                List<Map.Entry<String, Long>> topContent = contentCompletion.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .limit(8)
                        .collect(Collectors.toList());

                List<String> labels = topContent.stream().map(Map.Entry::getKey).collect(Collectors.toList());
                List<Number> values = topContent.stream().map(Map.Entry::getValue).collect(Collectors.toList());
                Image completionChart = buildBarChart("Content Completion", "Materials", "Completions", labels, values, false);
                if (completionChart != null) {
                    document.add(completionChart);
                }

                Image contentTypeChart = buildContentPieChart("Material Types", typeBreakdown);
                if (contentTypeChart != null) {
                    document.add(contentTypeChart);
                }
            }

            if (detailed && !studentSnapshots.isEmpty()) {
                document.add(new Paragraph("\nStudent Progress Table").setBold().setFontSize(14));
                Table table = new Table(4);
                table.addHeaderCell("Student");
                table.addHeaderCell("Email");
                table.addHeaderCell("Completed / Total");
                table.addHeaderCell("Progress %");

                for (StudentSnapshot snapshot : studentSnapshots) {
                    table.addCell(snapshot.name());
                    table.addCell(snapshot.email());
                    table.addCell(snapshot.completed() + " / " + snapshot.total());
                    table.addCell(String.format("%.1f%%", snapshot.percentage()));
                }

                document.add(table);

                document.add(new Paragraph("\nActionable Insights").setBold().setFontSize(14));
                if (performanceBuckets.get("Needs Attention (<50%)") > 0) {
                    document.add(new Paragraph("• Reach out to students falling below 50% to offer support."));
                }
                if (teacherContent.size() < 5) {
                    document.add(new Paragraph("• Consider adding more materials to diversify learning."));
                } else {
                    document.add(new Paragraph("• Keep sharing high-performing content to maintain engagement."));
                }
            }
        }

        System.out.println("✓ Teacher PDF generated: " + fileName);
        return fileName;
    }

    private void ensureReportsDirectory() {
        File reportsDir = new File("reports");
        if (!reportsDir.exists()) {
            reportsDir.mkdirs();
        }
    }

    private Image buildCompletionChart(long completed, long inProgress, String title) throws IOException {
        if (completed <= 0 && inProgress <= 0) {
            return null;
        }
        List<String> labels = List.of("Completed", "In Progress");
        List<Number> values = List.of(Math.max(completed, 0), Math.max(inProgress, 0));
        return buildBarChart(title, "Status", "Items", labels, values, false);
    }

    private Image buildBarChart(String title, String xTitle, String yTitle,
                                List<String> labels, List<Number> values, boolean showAnnotations) throws IOException {
        if (labels == null || labels.isEmpty() || values == null || values.isEmpty()) {
            return null;
        }
        CategoryChart chart = new CategoryChartBuilder()
                .width(650)
                .height(380)
                .title(title)
                .xAxisTitle(xTitle)
                .yAxisTitle(yTitle)
                .build();
        chart.getStyler().setLegendVisible(false);
        chart.getStyler().setXAxisLabelRotation(15);
        chart.addSeries(title, labels, values);
        return convertChartToImage(chart);
    }

    private Image buildContentPieChart(String title, Map<String, Long> data) throws IOException {
        if (data == null || data.isEmpty()) {
            return null;
        }
        boolean hasPositive = data.values().stream().anyMatch(value -> value > 0);
        if (!hasPositive) {
            return null;
        }
        PieChart chart = new PieChartBuilder()
                .width(450)
                .height(320)
                .title(title)
                .build();
        chart.getStyler().setLegendVisible(true);
        for (Map.Entry<String, Long> entry : data.entrySet()) {
            if (entry.getValue() > 0) {
                chart.addSeries(entry.getKey(), entry.getValue());
            }
        }
        return convertChartToImage(chart);
    }

    private Image convertChartToImage(Chart<?, ?> chart) throws IOException {
        BufferedImage bufferedImage = BitmapEncoder.getBufferedImage(chart);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", baos);
        Image image = new Image(ImageDataFactory.create(baos.toByteArray()));
        image.setAutoScale(true);
        image.setMarginTop(10f);
        image.setMarginBottom(20f);
        return image;
    }

    private record StudentSnapshot(String name, String email, double percentage, long completed, long total) {}
}
