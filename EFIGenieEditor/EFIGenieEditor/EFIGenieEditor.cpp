#include <fstream>
#include <qgridlayout.h>
#include "EFIGenieEditor.h"
#include "TableEditWidget.h"
#include <QMdiSubWindow>
#include <iostream>
#include <windows.h>
#include <cwchar>

QMdiArea *MainArea;
void read_directory(const std::string& name, std::vector<std::string>& v)
{
	std::string pattern(name);
	pattern.append("\\*");
	WIN32_FIND_DATA data;
	HANDLE hFind;
	std::wstring ws;
	ws.assign(pattern.begin(), pattern.end());
	if ((hFind = FindFirstFile(ws.c_str(), &data)) != INVALID_HANDLE_VALUE) {
		do {
			std::wstring ws2(data.cFileName);
			std::string s;
			s.assign(ws2.begin(), ws2.end());
			v.push_back(s);
		} while (FindNextFile(hFind, &data) != 0);
		FindClose(hFind);
	}
}
char* read_file_bytes(const std::string& file)
{
	std::ifstream t;
	int length;
	t.open(file);      // open input file
	t.seekg(0, std::ios::end);    // go to the end
	length = t.tellg();           // report location (this is the length)
	t.seekg(0, std::ios::beg);    // go back to the beginning
	char *buffer = (char*)calloc(length + 1, length + 1);    // allocate memory for a buffer of appropriate dimension
	t.read(buffer, length);       // read the whole file into the buffer
	t.close();                    // close file handle

	return buffer;
}
std::string read_file(const std::string& file)
{
	char *buffer = read_file_bytes(file);
	std::string fileString = std::string(buffer);
	delete buffer;

	return fileString;
}

void write_file(const std::string& file, unsigned char *buffer, int size)
{
	FILE * pFile;
	pFile = fopen(file.c_str(), "wb");
	fwrite(buffer, sizeof(unsigned char), size, pFile);
	fclose(pFile);
}

EFIGenieEditor::EFIGenieEditor(QWidget *parent)
	: QMainWindow(parent)
{
	//setWindowState(Qt::WindowMaximized);
	ui.setupUi(this);
	MainArea = ui.mainArea;

	std::string path = "config";
	std::vector<std::string> files;
	read_directory(path, files);
	std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions;
	std::string mainDefinition;
	for (std::string file : files)
	{
		int serviceId = 0;
		int typeId = 0;
		std::string serviceName = "";
		int pos = file.find("_");
		if (file.find("_") != -1)
		{
			auto params = Split(file, '_');
			if (params.size() < 3)
			{
				continue;
			}
			serviceId = atoi(params[0].c_str());
			typeId = atoi(params[1].c_str());
			serviceName = Split(params[2],'.')[0];
		}
		else if(file != "main.conf")
		{
			continue;
		}

		std::string definition = read_file("config/" + file);

		if (file != "main.conf")
		{
			std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>>::iterator it = definitions.find(serviceId);
			if (it == definitions.end())
			{
				std::map<unsigned char, std::pair<std::string, std::string>> typeDefinitions;
				typeDefinitions.insert(std::pair<unsigned char, std::pair<std::string, std::string>>(typeId, std::pair<std::string, std::string>(serviceName, definition)));
				definitions.insert(std::pair<int, std::map<unsigned char, std::pair<std::string, std::string>>>(serviceId, typeDefinitions));
			}
			else
			{
				it->second.insert(std::pair<unsigned char, std::pair<std::string, std::string>>(typeId, std::pair<std::string, std::string>(serviceName, definition)));
			}
		}
		else
		{
			mainDefinition = definition;
		}
	}

	for (std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>>::iterator itDef = definitions.begin(); itDef != definitions.end(); ++itDef)
	{
		for (std::map<unsigned char, std::pair<std::string, std::string>>::iterator itType = itDef->second.begin(); itType != itDef->second.end(); ++itType)
		{
			std::vector<std::string> lines = Split(itType->second.second, '\n');
			if (lines.size() > 0 && lines[0].size() >= 6 && lines[0].substr(0, 6) == "#COPY#")
			{
				std::vector<std::string> params = Split(lines[0], ' ');
				if (params.size() < 2)
				{
					continue;
				}
				params = Split(params[1], '_');
				if (params.size() < 2)
				{
					continue;
				}

				std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>>::iterator it = definitions.find(atoi(params[0].c_str()));
				if (it == definitions.end())
				{
					continue;
				}

				std::map<unsigned char, std::pair<std::string, std::string>>::iterator it2 = it->second.find(atoi(params[1].c_str()));

				if (it2 == it->second.end())
				{
					continue;
				}

				std::string definition = it2->second.second;

				bool skip = true;
				for (std::string line : lines)
				{
					if (skip)
					{
						skip = false;
						continue;
					}

					params = Split(line, '|');
					if (params.size() < 2)
					{
						continue;
					}

					const std::string s = params[0];
					const std::string t = params[1];

					std::string::size_type n = 0;
					while ((n = definition.find(s, n)) != std::string::npos)
					{
						definition.replace(n, s.size(), t);
						n += t.size();
					}
				}

				itType->second.second = definition;
			}
		}
	}

	QMdiSubWindow *subwindow = new QMdiSubWindow(ui.mainArea);
	mainConfigWidget = new ConfigWidget(mainDefinition,false, definitions);
	subwindow->setWidget(mainConfigWidget);
	subwindow->layout()->setSizeConstraint(QLayout::SetFixedSize);

	setWindowTitle("EFIGenie Editor");

	connect(ui.menuBar, SIGNAL(triggered(QAction *)), this, SLOT(triggered(QAction *)));
}

void EFIGenieEditor::triggered(QAction *action)
{
	if (action->text() == "Load Bin")
	{
		QFileDialog *dialog = new QFileDialog(this);
		char * val = read_file_bytes(dialog->getOpenFileName().toUtf8().constData());
		mainConfigWidget->setConfigValue((void *)val);
	}
	if (action->text() == "Save Bin")
	{
		QFileDialog *dialog = new QFileDialog(this);
		unsigned char * configBin = (unsigned char *)mainConfigWidget->getConfigValue();
		write_file(dialog->getSaveFileName().toUtf8().constData(), configBin, mainConfigWidget->configSize());
		delete configBin;
	}
}
