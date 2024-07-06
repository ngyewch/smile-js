import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.smile.SmileFactory;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Callable;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.text.StringEscapeUtils;
import picocli.CommandLine;

@CommandLine.Command(name = "generateTestData", description = "Generate test data.")
public class GenerateTestData implements Callable<Integer> {

  @CommandLine.Parameters(index = "0", description = "Directory containing JSON input files")
  private File inputDirectory;

  @CommandLine.Parameters(index = "1", description = "Javascript output file")
  private File outputFile;

  private final ObjectMapper jsonObjectMapper = new ObjectMapper();
  private final ObjectMapper smileObjectMapper = new ObjectMapper(new SmileFactory());

  @Override
  public Integer call() throws Exception {
    final File outputDirectory = outputFile.getParentFile();
    outputDirectory.mkdirs();

    try (final OutputStream outputStream = new FileOutputStream(outputFile)) {
      try (final Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
        try (final PrintWriter pw = new PrintWriter(writer)) {
          pw.println("export const testData: { [key: string]: string } = {};");
          final File[] files = inputDirectory.listFiles();
          if (files != null) {
            for (final File file : files) {
              if (file.isDirectory() || !file.getName().endsWith(".json")) {
                continue;
              }
              final Object o = jsonObjectMapper.readValue(file, Object.class);
              final File jsonFile =
                  new File(outputDirectory, adjustFileExtension(file.getName(), ".min.json"));
              pw.format(
                  "testData['%s'] = '%s';\n",
                  StringEscapeUtils.escapeEcmaScript(jsonFile.getName()),
                  StringEscapeUtils.escapeEcmaScript(jsonObjectMapper.writeValueAsString(o)));
              jsonObjectMapper.writeValue(jsonFile, o);
              final File smileFile =
                  new File(outputDirectory, adjustFileExtension(file.getName(), ".sml"));
              smileObjectMapper.writeValue(smileFile, o);
              final ByteArrayOutputStream baos = new ByteArrayOutputStream();
              smileObjectMapper.writeValue(baos, o);
              pw.format(
                  "testData['%s'] = '%s';\n",
                  StringEscapeUtils.escapeEcmaScript(smileFile.getName()),
                  StringEscapeUtils.escapeEcmaScript(
                      Base64.encodeBase64String(baos.toByteArray())));
            }
          }
        }
      }
    }
    return 0;
  }

  private static String adjustFileExtension(String filename, String extension) {
    return FilenameUtils.getBaseName(filename) + extension;
  }
}
