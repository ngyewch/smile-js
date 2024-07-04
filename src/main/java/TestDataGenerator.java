import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.smile.SmileFactory;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringEscapeUtils;

public class TestDataGenerator {

  private static File getTargetFile(File outputDir, File file, String extension) {
    return new File(outputDir, FilenameUtils.getBaseName(file.getPath()) + extension);
  }

  public static void main(String[] args) throws Exception {
    final ObjectMapper jsonObjectMapper = new ObjectMapper();
    final ObjectMapper smileObjectMapper = new ObjectMapper(new SmileFactory());

    final File dataDir = new File(args[0]);
    final File outputDir = new File(args[1]);
    outputDir.mkdirs();

    try (final OutputStream ostrm = new FileOutputStream(new File(outputDir, "testData.ts"))) {
      try (final Writer writer = new OutputStreamWriter(ostrm, "UTF-8")) {
        try (final PrintWriter pw = new PrintWriter(writer)) {
          pw.println("export const testData: { [key: string]: string } = {};");
          for (final File file : dataDir.listFiles()) {
            final Object o = jsonObjectMapper.readValue(file, Object.class);
            final File jsonFile = getTargetFile(outputDir, file, ".min.json");
            pw.format(
                "testData['%s'] = '%s';\n",
                StringEscapeUtils.escapeEcmaScript(jsonFile.getName()),
                StringEscapeUtils.escapeEcmaScript(jsonObjectMapper.writeValueAsString(o)));
            jsonObjectMapper.writeValue(jsonFile, o);
            final File smileFile = getTargetFile(outputDir, file, ".smile");
            smileObjectMapper.writeValue(smileFile, o);
            final ByteArrayOutputStream baos = new ByteArrayOutputStream();
            smileObjectMapper.writeValue(baos, o);
            pw.format(
                "testData['%s'] = '%s';\n",
                StringEscapeUtils.escapeEcmaScript(smileFile.getName()),
                StringEscapeUtils.escapeEcmaScript(Base64.encodeBase64String(baos.toByteArray())));
          }
        }
      }
    }
  }
}
