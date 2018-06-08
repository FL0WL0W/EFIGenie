#include "ConfigWidget.h"
#include <ConfigSelectorWidget.h>
#include <ConfigDialogWidget.h>

ConfigWidget::ConfigWidget(std::string definition, bool isConfigPointer, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions, int maxHeight)
{
	IsConfigPointer = isConfigPointer;

	std::vector<std::string> lines = Split(definition, '\n');

	QGridLayout *layout = new QGridLayout;

	layout->setSizeConstraint(QLayout::SetFixedSize);
	layout->setMargin(5);

	setLayout(layout);

	int col = 0;
	int row = 0;
	for (int i = 0; i < lines.size(); ++i)
	{
		std::vector<std::string> params = Split(lines[i], ' ');
		bool isPointer = false;
		if (params[0][0] == '*')
		{
			params[0] = params[0].substr(1, params[0].size() - 1);
			isPointer = true;
		}
		std::string baseType = Split(Split(Split(params[0], '*')[0], '_')[0], '[')[0];
		if (Split(params[0], '[').size() > 1 && (baseType == "uint8"
			|| baseType == "int8"
			|| baseType == "uint16"
			|| baseType == "int16"
			|| baseType == "uint32"
			|| baseType == "int32"
			|| baseType == "uint64"
			|| baseType == "int64"
			|| baseType == "float32"
			|| baseType == "float64"))
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
			double xMinMult = 1;
			double xResMult = 1;
			double xMaxMult = 1;
			if (xBounds.size() >= 3)
			{
				for (std::pair<std::string, IConfigWidget *> widget : Widgets)
				{
					if (widget.first == Split(xBounds[0], '*')[0])
						xMin = (double *)widget.second->getValue();
					if (widget.first == Split(xBounds[1], '*')[0])
						xRes = (double *)widget.second->getValue();
					if (widget.first == Split(xBounds[2], '*')[0])
						xMax = (double *)widget.second->getValue();
				}

				if (xMin == 0)
				{
					xMin = (double*)malloc(sizeof(double));
					double buff = atof(Split(xBounds[0], '*')[0].c_str());
					CopyDoubleToLocationType<double>((void*)xMin, (void*)&buff);
				}
				if (xRes == 0)
				{
					xRes = (double*)malloc(sizeof(double));
					double buff = atoi(Split(xBounds[1], '*')[0].c_str());
					CopyDoubleToLocationType<double>((void*)xRes, (void*)&buff);
				}
				if (xMax == 0)
				{
					xMax = (double*)malloc(sizeof(double));
					double buff = atof(Split(xBounds[2], '*')[0].c_str());
					CopyDoubleToLocationType<double>((void*)xMax, (void*)&buff);
				}

				if (Split(xBounds[0], '*').size() > 1)
				{
					xMinMult = atof(Split(xBounds[0], '*')[1].c_str());
				}
				if (Split(xBounds[1], '*').size() > 1)
				{
					xResMult = atof(Split(xBounds[1], '*')[1].c_str());
				}
				if (Split(xBounds[2], '*').size() > 1)
				{
					xMaxMult = atof(Split(xBounds[2], '*')[1].c_str());
				}
			}

			if (Split(params[0], '[').size() == 3)
			{
				std::vector<std::string> yBounds = Split(Split(Split(params[0], '[')[2], ']')[0], ':');
				double *yMin = 0;
				double *yRes = 0;
				double *yMax = 0;
				double yMinMult = 1;
				double yResMult = 1;
				double yMaxMult = 1;
				if (yBounds.size() >= 3)
				{
					for (std::pair<std::string, IConfigWidget *> widget : Widgets)
					{
						if (widget.first == Split(yBounds[0], '*')[0])
							yMin = (double *)widget.second->getValue();
						if (widget.first == Split(yBounds[1], '*')[0])
							yRes = (double *)widget.second->getValue();
						if (widget.first == Split(yBounds[2], '*')[0])
							yMax = (double *)widget.second->getValue();
					}

					if (yMin == 0)
					{
						yMin = (double*)malloc(sizeof(double));
						double buff = atof(Split(yBounds[0], '*')[0].c_str());
						CopyDoubleToLocationType<double>((void*)yMin, (void*)&buff);
					}
					if (yRes == 0)
					{
						yRes = (double*)malloc(sizeof(double));
						double buff = atoi(Split(yBounds[1], '*')[0].c_str());
						CopyDoubleToLocationType<double>((void*)yRes, (void*)&buff);
					}
					if (yMax == 0)
					{
						yMax = (double*)malloc(sizeof(double));
						double buff = atof(Split(yBounds[2], '*')[0].c_str());
						CopyDoubleToLocationType<double>((void*)yMax, (void*)&buff);
					}

					if (Split(yBounds[0], '*').size() > 1)
					{
						yMinMult = atof(Split(yBounds[0], '*')[1].c_str());
					}
					if (Split(yBounds[1], '*').size() > 1)
					{
						yResMult = atof(Split(yBounds[1], '*')[1].c_str());
					}
					if (Split(yBounds[2], '*').size() > 1)
					{
						yMaxMult = atof(Split(yBounds[2], '*')[1].c_str());
					}
				}

				Table2ConfigWidget * widget = new Table2ConfigWidget(params[1].c_str(), baseType, isPointer, params[2].c_str(), multiplier, xMin, xMinMult, xRes, xResMult, xMax, xMaxMult, yMin, yMinMult, yRes, yResMult, yMax, yMaxMult);
				widget->setParent(this);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));
				
				layout->addWidget(widget, row++, col);
				if (maxHeight < layout->sizeHint().height())
				{
					layout->removeWidget(widget);
					col++;
					i = 0;
					layout->addWidget(widget, row++, col);
				}
				layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
			}
			else
			{
				Table1ConfigWidget * widget = new Table1ConfigWidget(params[1].c_str(), baseType, isPointer, params[2].c_str(), xMin, xMinMult, xRes, xResMult, xMax, xMaxMult, multiplier);
				widget->setParent(this);

				Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

				layout->addWidget(widget, row++, col);
				if (maxHeight < layout->sizeHint().height())
				{
					layout->removeWidget(widget);
					col++;
					row = 0;
					layout->addWidget(widget, row++, col);
				}
				layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
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

			if (params[1].c_str()[0] != '.')
			{
				layout->addWidget(widget, row++, col);
				if (maxHeight < layout->sizeHint().height())
				{
					layout->removeWidget(widget);
					col++;
					row = 0;
					layout->addWidget(widget, row++, col);
				}
				layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
			}
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

			if (params[1].c_str()[0] != '.')
			{
				layout->addWidget(widget, row++, col);
				if (maxHeight < layout->sizeHint().height())
				{
					layout->removeWidget(widget);
					col++;
					row = 0;
					layout->addWidget(widget, row++, col);
				}
				layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
			}
		}
		else if (baseType == "bool")
		{
			BoolConfigWidget * widget = new BoolConfigWidget(params[1].c_str(), (bool)atoi(params[2].c_str()));

			Widgets.push_back(std::pair<std::string, IConfigWidget *>(params[1], widget));

			if (params[1].c_str()[0] != '.')
			{
				layout->addWidget(widget, row++, col);
				if (maxHeight < layout->sizeHint().height())
				{
					layout->removeWidget(widget);
					col++;
					row = 0;
					layout->addWidget(widget, row++, col);
				}
				layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
			}
		}
		else if (baseType == "uint8bool")
		{
		}
		else if (baseType == "uint16bool")
		{
		}
		else
		{
			int times = 1;
			if (Split(params[0], '[').size() > 1)
			{
				times = atoi(Split(Split(params[0], ']')[0], '[')[1].c_str());
			}
			int serviceId = atoi(baseType.c_str());

			for (int t = 0; t < times; t++)
			{
				std::string name = params[1];
				if (times > 1)
				{
					name += "(%d)";
					char * nameBuffer = (char *)calloc(name.length() + 10, name.length() + 10);
					sprintf(nameBuffer, name.c_str(), t+1);
					name = std::string(nameBuffer);
					delete nameBuffer;
				}
				if (Split(Split(params[0], '[')[0], '_').size() < 2 || Split(Split(params[0], '[')[0], '_')[1][0] == 'D' || Split(Split(params[0], '[')[0], '_')[1][0] == 'S')
				{
					bool isStatic = false;

					if (Split(Split(params[0], '[')[0], '_')[1].length() > 1 && Split(Split(params[0], '[')[0], '_')[1][1] == 'S')
					{
						isStatic = true;
					}

					ConfigDialogWidget * widget = new ConfigDialogWidget(name.c_str(), serviceId, isPointer, isStatic, Split(Split(params[0], '[')[0], '_')[1][0] == 'S', definitions);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(name, widget));

					layout->addWidget(widget, row++, col);
					if (maxHeight < layout->sizeHint().height())
					{
						layout->removeWidget(widget);
						col++;
						row = 0;
						layout->addWidget(widget, row++, col);
					}
					layout->setAlignment(widget, Qt::AlignLeft | Qt::AlignTop);
				}
				else if (Split(Split(params[0], '[')[0], '_')[1][0] == 'E')
				{
					bool isStatic = false;

					if (Split(Split(params[0], '[')[0], '_')[1].length() > 1 && Split(Split(params[0], '[')[0], '_')[1][1] == 'S')
					{
						isStatic = true;
					}

					QGridLayout *sublayout = new QGridLayout();
					sublayout->setMargin(0);
					sublayout->setSpacing(0);
					QLabel * text = new QLabel(QString(name.c_str()));
					text->setFixedSize(550, 25);
					sublayout->addWidget(text, 0, 0);

					QGridLayout *subsublayout = new QGridLayout();
					subsublayout->setMargin(0);
					subsublayout->setSpacing(0);
					QLabel * padding = new QLabel(QString(""));
					padding->setFixedSize(50, 25);
					subsublayout->addWidget(padding, 0, 0);

					ConfigSelectorWidget * widget = new ConfigSelectorWidget(serviceId, isPointer, isStatic, definitions);

					Widgets.push_back(std::pair<std::string, IConfigWidget *>(name, widget));

					subsublayout->addWidget(widget, 0, 1);
					subsublayout->setSizeConstraint(QLayout::SetFixedSize);

					sublayout->addLayout(subsublayout, 1, 0);
					QWidget *subWidget = new QWidget();
					subWidget->setLayout(sublayout);

					layout->addWidget(subWidget, row++, col);
					if (maxHeight < layout->sizeHint().height())
					{
						layout->removeWidget(subWidget);
						col++;
						row = 0;
						layout->addWidget(subWidget, row++, col);
					}
					layout->setAlignment(subWidget, Qt::AlignLeft | Qt::AlignTop);
				}
			}
		}
	}
}

void * ConfigWidget::getValue()
{
	throw;
}

void ConfigWidget::setValue(void *)
{
	throw;
}

void * ConfigWidget::getConfigValue()
{
	void * val = malloc(configSize());
	void * buildVal = val;
	for (std::pair<std::string, IConfigWidget *> widget : Widgets)
	{
		if (widget.second->isConfigPointer())
			buildVal = (void *)((unsigned int *)buildVal + 1);
		else
		{
			int cfgSize = widget.second->configSize();
			memcpy(buildVal, widget.second->getConfigValue(), widget.second->configSize());

			buildVal = (void *)((unsigned char *)buildVal + widget.second->configSize());
		}
	}
	for (std::pair<std::string, IConfigWidget *> widget : Widgets)
	{
		if (widget.second->isConfigPointer())
		{
			memcpy(buildVal, widget.second->getConfigValue(), widget.second->configSize());

			buildVal = (void *)((unsigned char *)buildVal + widget.second->configSize());
		}
	}

	return val;
}

void ConfigWidget::setConfigValue(void *val)
{
	void * buildVal = val;
	for (std::pair<std::string, IConfigWidget *> widget : Widgets)
	{
		if (widget.second->isConfigPointer())
			buildVal = (void *)((unsigned int *)buildVal + 1);
		else
		{
			widget.second->setConfigValue(buildVal);

			buildVal = (void *)((unsigned char *)buildVal + widget.second->configSize());
		}
	}
	for (std::pair<std::string, IConfigWidget *> widget : Widgets)
	{
		if (widget.second->isConfigPointer())
		{
			widget.second->setConfigValue(buildVal);

			buildVal = (void *)((unsigned char*)buildVal + widget.second->configSize());
		}
	}
}

unsigned int ConfigWidget::configSize()
{
	unsigned int size = 0;
	for (std::pair<std::string, IConfigWidget *> widget : Widgets)
	{
		if (widget.second->isConfigPointer())
			size += sizeof(unsigned int);

		size += widget.second->configSize();
	}

	return size;
}

bool ConfigWidget::isConfigPointer()
{
	return IsConfigPointer;
}

std::string ConfigWidget::getConfigType()
{
	return "";
}
