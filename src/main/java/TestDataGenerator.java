
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
        ObjectMapper jsonObjectMapper = new ObjectMapper();
        ObjectMapper smileObjectMapper = new ObjectMapper(new SmileFactory());

        File dataDir = new File(args[0]);
        File outputDir = new File(args[1]);
        outputDir.mkdirs();

        try (OutputStream ostrm = new FileOutputStream(new File(outputDir, "testData.js"))) {
            try (Writer writer = new OutputStreamWriter(ostrm, "UTF-8")) {
                try (PrintWriter pw = new PrintWriter(writer)) {
                    pw.println("testData = {};");
                    for (File file : dataDir.listFiles()) {
                        Object o = jsonObjectMapper.readValue(file, Object.class);
                        File jsonFile = getTargetFile(outputDir, file, ".min.json");
                        pw.format("testData['%s'] = '%s';\n", StringEscapeUtils.escapeEcmaScript(jsonFile.getName()), StringEscapeUtils.escapeEcmaScript(jsonObjectMapper.writeValueAsString(o)));
                        jsonObjectMapper.writeValue(jsonFile, o);
                        File smileFile = getTargetFile(outputDir, file, ".smile");
                        smileObjectMapper.writeValue(smileFile, o);
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        smileObjectMapper.writeValue(baos, o);
                        pw.format("testData['%s'] = '%s';\n", StringEscapeUtils.escapeEcmaScript(smileFile.getName()), StringEscapeUtils.escapeEcmaScript(Base64.encodeBase64String(baos.toByteArray())));
                    }
                }
            }
        }
    }
}
