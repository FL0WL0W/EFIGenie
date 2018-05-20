#include <string>
#include <vector>
#include <Functions.h>
#include <QGridLayout>
#include <QLabel>
#include <IConfigWidget.h>
#include <vector>
#include <NumberConfigWidget.h>
#include <BoolConfigWidget.h>
#include <Table1ConfigWidget.h>
#include <Table2ConfigWidget.h>


#ifndef ConfigWidget_H
#define ConfigWidget_H

class ConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public:
	std::vector<std::pair<std::string, IConfigWidget *>> Widgets;
	bool IsConfigPointer;

	ConfigWidget(std::string definition, bool isConfigPointer, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions, int maxHeight = 4000);

	void * getValue();

	void setValue(void *);
	
	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif
