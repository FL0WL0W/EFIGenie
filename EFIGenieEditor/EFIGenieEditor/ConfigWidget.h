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
public:
	std::vector<std::pair<std::string, IConfigWidget *>> Widgets;

	ConfigWidget(std::string definition)
	{
		std::vector<std::string> lines = Split(definition, '\n');

		QGridLayout *layout = new QGridLayout;

		for (int i = 0; i < lines.size(); ++i)
		{
			std::vector<std::string> params = Split(lines[i], ' ');
			std::string baseType = Split(Split(Split(params[0], '*')[0], '_')[0], '[')[0];
			if (Split(params[0], '[').size() > 1)
			{
				std::vector<std::string> xBounds = Split(Split(Split(params[0], '[')[1], ']')[0], ':');
				double multiplier = 1;
				if (Split(params[0], '*').size() > 1)
				{
					multiplier = atof(Split(Split(Split(params[0], '*')[1], '_')[0], '[')[0].c_str());
				}

				double *xMin = 0;
				double *xRes = 0;
				double *xMax = 0;
				if (xBounds.size() >= 3)
				{
					for (std::pair<std::string, IConfigWidget *> widget : Widgets)
					{
						if (widget.first == xBounds[0])
							xMin = (double *)widget.second->getValue();
						if (widget.first == xBounds[1])
							xRes = (double *)widget.second->getValue();
						if (widget.first == xBounds[2])
							xMax = (double *)widget.second->getValue();
					}

					if (xMin == 0)
					{
						xMin = (double*)malloc(sizeof(double));
						double buff = atof(xBounds[0].c_str());
						CopyDoubleToLocationType<double>((void*)xMin, (void*)&buff);
					}
					if (xRes == 0)
					{
						xRes = (double*)malloc(sizeof(double));
						double buff = atoi(xBounds[1].c_str());
						CopyDoubleToLocationType<double>((void*)xRes, (void*)&buff);
					}
					if (xMax == 0)
					{
						xMax = (double*)malloc(sizeof(double));
						double buff = atof(xBounds[3].c_str());
						CopyDoubleToLocationType<double>((void*)xMax, (void*)&buff);
					}
				}

				if (Split(params[0], '[').size() == 3)
				{
					std::vector<std::string> yBounds = Split(Split(Split(params[0], '[')[2], ']')[0], ':');
					double *yMin = 0;
					double *yRes = 0;
					double *yMax = 0;
					if (yBounds.size() >= 3)
					{
						for (std::pair<std::string, IConfigWidget *> widget : Widgets)
						{
							if (widget.first == yBounds[0])
								yMin = (double *)widget.second->getValue();
							if (widget.first == yBounds[1])
								yRes = (double *)widget.second->getValue();
							if (widget.first == yBounds[2])
								yMax = (double *)widget.second->getValue();
						}

						if (yMin == 0)
						{
							yMin = (double*)malloc(sizeof(double));
							double buff = atof(yBounds[0].c_str());
							CopyDoubleToLocationType<double>((void*)yMin, (void*)&buff);
						}
						if (yRes == 0)
						{
							yRes = (double*)malloc(sizeof(double));
							double buff = atoi(yBounds[1].c_str());
							CopyDoubleToLocationType<double>((void*)yRes, (void*)&buff);
						}
						if (yMax == 0)
						{
							yMax = (double*)malloc(sizeof(double));
							double buff = atof(yBounds[3].c_str());
							CopyDoubleToLocationType<double>((void*)yMax, (void*)&buff);
						}

					}

					Table2ConfigWidget * widget = new Table2ConfigWidget(params[1].c_str(), baseType, multiplier, xMin, xRes, xMax, yMin, yRes, yMax);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

					layout->addWidget(widget, i, 0);
				}
				else
				{
					Table1ConfigWidget * widget = new Table1ConfigWidget(params[1].c_str(), baseType, xMin, xRes, xMax);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

					layout->addWidget(widget, i, 0);
				}

			}
			else if (baseType == "uint8"
				|| baseType == "int8"
				|| baseType == "uint16"
				|| baseType == "int16"
				|| baseType == "uint32"
				|| baseType == "int32"
				|| baseType == "uint64"
				|| baseType == "int64")
			{
				int decimals = 0;
				double multiplier = 1;
				if (Split(params[0], '*').size() > 1)
				{
					multiplier = atof(Split(Split(params[0], '*')[1], '_')[0].c_str());
					if (Split(params[0], '_').size() > 1)
					{
						decimals = atoi(Split(params[0], '_')[1].c_str());
					}
				}

				NumberConfigWidget * widget = new NumberConfigWidget(params[1].c_str(), params[2].c_str(), atof(params[3].c_str()), atof(params[5].c_str()), atof(params[4].c_str()), decimals, multiplier, baseType);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

				layout->addWidget(widget, i, 0);
			}
			else if (baseType == "float32" || baseType == "float64")
			{
				int decimals = 0;
				if (Split(params[0], '_').size() > 1)
				{
					decimals = atoi(Split(params[0], '_')[1].c_str());
				}
				else
				{
					decimals = 10;
				}

				double multiplier = 1;
				if (Split(params[0], '*').size() > 1)
				{
					multiplier = atof(Split(Split(params[0], '*')[1], '_')[0].c_str());
				}

				NumberConfigWidget * widget = new NumberConfigWidget(params[1].c_str(), params[2].c_str(), atof(params[3].c_str()), atof(params[5].c_str()), atof(params[4].c_str()), decimals, multiplier, baseType);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

				layout->addWidget(widget, i, 0);
			}
		}

		setLayout(layout);
	}

	void * getValue()
	{
		throw;
	}

	void setValue(void *)
	{
		throw;
	}
	
	void * getConfigValue()
	{
		void * val = malloc(configSize());
		void * buildVal = val;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isConfigPointer())
				buildVal = (void *)((unsigned int)buildVal + 1);
			else
			{
				memcpy(buildVal, widget.second->getConfigValue(), widget.second->configSize());

				buildVal = (void *)((unsigned char)buildVal + widget.second->configSize());
			}
		}
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isConfigPointer())
			{
				memcpy(buildVal, widget.second->getConfigValue(), widget.second->configSize());

				buildVal = (void *)((unsigned char)buildVal + widget.second->configSize());
			}
		}

		return val;
	}

	void setConfigValue(void *val)
	{
		void * buildVal = val;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isConfigPointer())
				buildVal = (void *)((unsigned int)buildVal + 1);
			else
			{
				widget.second->setConfigValue(buildVal);

				buildVal = (void *)((unsigned char)buildVal + widget.second->configSize());
			}
		}
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if (widget.second->isConfigPointer())
			{
				widget.second->setConfigValue(buildVal);

				buildVal = (void *)((unsigned char)buildVal + widget.second->configSize());
			}
		}
	}

	unsigned int configSize()
	{
		unsigned int size = 0;
		for (std::pair<std::string, IConfigWidget *> widget : Widgets)
		{
			if(widget.second->isConfigPointer())
				size += sizeof(unsigned int);

			size += widget.second->configSize();
		}

		return size;
	}

	bool isConfigPointer()
	{
		return true;
	}

	std::string getConfigType()
	{
		return "";
	}
};
#endif
