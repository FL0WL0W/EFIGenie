#include <fstream>
#include <qgridlayout.h>
#include "EFIGenieEditor.h"
#include <ConfigWidget.h>
#include <QMdiSubWindow>

EFIGenieEditor::EFIGenieEditor(QWidget *parent)
	: QMainWindow(parent)
{
	ui.setupUi(this);

	std::ifstream t;
	int length;
	t.open("file.txt");      // open input file
	t.seekg(0, std::ios::end);    // go to the end
	length = t.tellg();           // report location (this is the length)
	t.seekg(0, std::ios::beg);    // go back to the beginning
	char *buffer = (char*)calloc(length + 1, length + 1);    // allocate memory for a buffer of appropriate dimension
	t.read(buffer, length);       // read the whole file into the buffer
	t.close();                    // close file handle

	std::string definition = std::string(buffer);

	QMdiSubWindow *subwindow = new QMdiSubWindow(ui.mainArea);

	QGridLayout *layout = new QGridLayout;

	ConfigWidget *configWidget = new ConfigWidget(definition);

	subwindow->setWidget(configWidget);

	setWindowTitle("Camera Window");
}
