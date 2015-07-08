
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.smile.SmileFactory;
import java.io.File;
import org.apache.commons.io.FilenameUtils;

public class TestDataGenerator {
    private static File getTargetFile(File outputDir, File file, String extension) {
      return new File(outputDir, FilenameUtils.getBaseName(file.getPath()) + extension);
    }

    public static void main(String[] args) throws Exception {
        ObjectMapper jsonObjectMapper = new ObjectMapper();
        ObjectMapper smileObjectMapper = new ObjectMapper(new SmileFactory());

        File dataDir = new File("src/test/data");
        File outputDir = new File("build/test/data");
        outputDir.mkdirs();
        for (File file : dataDir.listFiles()) {
            Object o = jsonObjectMapper.readValue(file, Object.class);
            jsonObjectMapper.writeValue(getTargetFile(outputDir, file, ".min.json"), o);
            smileObjectMapper.writeValue(getTargetFile(outputDir, file, ".smile"), o);
        }
    }
}
