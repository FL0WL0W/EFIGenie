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
#include <ConfigSelectorWidget.h>
#include <EFIGenieEditor.h>

#ifndef ConfigDialogWidget_H
#define ConfigDialogWidget_H
class ConfigDialogWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public slots:
	void edit();
public:
	QLabel * Label;
	QPushButton * Button;
	ConfigSelectorWidget *configSelectorWidget = 0;
	QGridLayout *layout = new QGridLayout;
	QMdiSubWindow *dialog;
	unsigned char ServiceId;
	bool IsConfigPointer;

	ConfigDialogWidget(const char * label, unsigned short serviceId, bool isConfigPointer, bool isStatic, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions);
	
	void * getValue();

	void setValue(void *);

	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif
