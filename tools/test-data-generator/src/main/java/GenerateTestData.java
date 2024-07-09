import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.smile.SmileFactory;
import com.fasterxml.jackson.dataformat.smile.SmileGenerator;
import java.io.*;
import java.util.Arrays;
import java.util.Collection;
import java.util.concurrent.Callable;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import picocli.CommandLine;

@CommandLine.Command(name = "generateTestData", description = "Generate test data.")
public class GenerateTestData implements Callable<Integer> {

  @CommandLine.Parameters(index = "0", description = "Directory containing JSON input files")
  private File inputDirectory;

  @CommandLine.Parameters(index = "1", description = "Output directory for SMILE-encoded files")
  private File outputDirectory;

  @CommandLine.Option(
      names = {"-r", "--recursive"},
      description = "Recursive")
  private boolean recursive;

  @CommandLine.Option(
      names = {"--compare-reference"},
      description = "Compare reference")
  private boolean compareReference;

  @Override
  public Integer call() throws Exception {
    final Collection<File> jsonInputFiles =
        FileUtils.listFiles(inputDirectory, new String[] {"json"}, recursive);
    for (final File jsonInputFile : jsonInputFiles) {
      final String relativePath =
          inputDirectory.toURI().relativize(jsonInputFile.toURI()).getPath();
      final InputData inputData = readInputData(jsonInputFile);

      final SmileFactory smileFactory = new SmileFactory();
      smileFactory.configure(
          SmileGenerator.Feature.CHECK_SHARED_NAMES, inputData.isSharedProperties());
      smileFactory.configure(
          SmileGenerator.Feature.CHECK_SHARED_STRING_VALUES, inputData.isSharedStrings());
      smileFactory.configure(
          SmileGenerator.Feature.ENCODE_BINARY_AS_7BIT, !inputData.isRawBinary());

      final ObjectMapper smileObjectMapper = new ObjectMapper(smileFactory);
      final File currentOutputDirectory = new File(outputDirectory, relativePath).getParentFile();
      currentOutputDirectory.mkdirs();
      final File smileOutputFile =
          new File(currentOutputDirectory, adjustFileExtension(jsonInputFile.getName(), ".smile"));
      smileObjectMapper.writeValue(smileOutputFile, inputData.getValue());

      final File jsonOutputFile = new File(currentOutputDirectory, jsonInputFile.getName());
      FileUtils.copyFile(jsonInputFile, jsonOutputFile);

      if (compareReference) {
        final File currentInputDirectory = new File(inputDirectory, relativePath).getParentFile();
        final File referenceFile =
            new File(currentInputDirectory, adjustFileExtension(jsonInputFile.getName(), ".smile"));

        final byte[] outputBytes = FileUtils.readFileToByteArray(smileOutputFile);
        final byte[] referenceBytes = FileUtils.readFileToByteArray(referenceFile);
        if (!Arrays.equals(outputBytes, referenceBytes)) {
          System.out.printf("[MISMATCH] %s\n", relativePath);
        }
      }
    }
    return 0;
  }

  private InputData readInputData(File inputFile) throws IOException {
    final ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
    return objectMapper.readValue(inputFile, InputData.class);
  }

  private static String adjustFileExtension(String filename, String extension) {
    return FilenameUtils.getBaseName(filename) + extension;
  }

  public static class InputData {
    private Object value;
    private boolean sharedStrings;
    private boolean sharedProperties;
    private boolean rawBinary;

    public Object getValue() {
      return value;
    }

    public void setValue(Object value) {
      this.value = value;
    }

    public boolean isSharedStrings() {
      return sharedStrings;
    }

    public void setSharedStrings(boolean sharedStrings) {
      this.sharedStrings = sharedStrings;
    }

    public boolean isSharedProperties() {
      return sharedProperties;
    }

    public void setSharedProperties(boolean sharedProperties) {
      this.sharedProperties = sharedProperties;
    }

    public boolean isRawBinary() {
      return rawBinary;
    }

    public void setRawBinary(boolean rawBinary) {
      this.rawBinary = rawBinary;
    }
  }
}
