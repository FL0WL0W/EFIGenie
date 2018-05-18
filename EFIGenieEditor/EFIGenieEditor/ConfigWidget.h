#include <string>
#include <vector>
#include <Functions.h>
#include <QGridLayout>
#include <IConfigWidget.h>
#include <vector>
#include <NumberConfigWidget.h>
#include <Table1ConfigWidget.h>
#include <Table2ConfigWidget.h>


#ifndef ConfigWidget_H
#define ConfigWidget_H

class ConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public:
	std::vector<std::pair<std::string, IConfigWidget *>> Widgets;

	ConfigWidget(std::string definition, std::map<unsigned short, std::map<unsigned char, std::pair<std::string, std::string>>> definitions);

	void * getValue();

	void setValue(void *);
	
	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif
