#include <string>
#include <vector>
#include <Functions.h>
#include <QGridLayout>
#include <QComboBox>
#include <IConfigWidget.h>
#include <vector>
#include <NumberConfigWidget.h>
#include <Table1ConfigWidget.h>
#include <Table2ConfigWidget.h>
#include <ConfigWidget.h>

#ifndef ConfigSelectorWidget_H
#define ConfigSelectorWidget_H
class ConfigSelectorWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public slots:
	void currentIndexChanged(int index);
public:
	ConfigWidget *configWidget = 0;
	QComboBox *Selection;
	std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> Definitions;
	std::map<unsigned char, std::pair<std::string, std::string>> TypeDefinitions;
	QGridLayout *layout = new QGridLayout;
	unsigned char ServiceId;
	int MaxHeight;
	bool IsConfigPointer;

	ConfigSelectorWidget(unsigned short serviceId, bool isConfigPointer, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions, int maxHeight = 4000);

	void setServiceId(unsigned char serviceId);

	void * getValue();

	void setValue(void *);

	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif
