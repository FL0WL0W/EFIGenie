/********************************************************************************
** Form generated from reading UI file 'EFIGenieEditor.ui'
**
** Created by: Qt User Interface Compiler version 5.10.1
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_EFIGENIEEDITOR_H
#define UI_EFIGENIEEDITOR_H

#include <QtCore/QVariant>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QButtonGroup>
#include <QtWidgets/QHeaderView>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMdiArea>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_EFIGenieEditorClass
{
public:
    QWidget *centralWidget;
    QMdiArea *mainArea;
    QMenuBar *menuBar;
    QToolBar *mainToolBar;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *EFIGenieEditorClass)
    {
        if (EFIGenieEditorClass->objectName().isEmpty())
            EFIGenieEditorClass->setObjectName(QStringLiteral("EFIGenieEditorClass"));
        EFIGenieEditorClass->resize(964, 980);
        centralWidget = new QWidget(EFIGenieEditorClass);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        mainArea = new QMdiArea(centralWidget);
        mainArea->setObjectName(QStringLiteral("mainArea"));
        mainArea->setGeometry(QRect(0, 50, 981, 911));
        EFIGenieEditorClass->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(EFIGenieEditorClass);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 964, 26));
        EFIGenieEditorClass->setMenuBar(menuBar);
        mainToolBar = new QToolBar(EFIGenieEditorClass);
        mainToolBar->setObjectName(QStringLiteral("mainToolBar"));
        EFIGenieEditorClass->addToolBar(Qt::TopToolBarArea, mainToolBar);
        statusBar = new QStatusBar(EFIGenieEditorClass);
        statusBar->setObjectName(QStringLiteral("statusBar"));
        EFIGenieEditorClass->setStatusBar(statusBar);

        retranslateUi(EFIGenieEditorClass);

        QMetaObject::connectSlotsByName(EFIGenieEditorClass);
    } // setupUi

    void retranslateUi(QMainWindow *EFIGenieEditorClass)
    {
        EFIGenieEditorClass->setWindowTitle(QApplication::translate("EFIGenieEditorClass", "EFIGenieEditor", nullptr));
    } // retranslateUi

};

namespace Ui {
    class EFIGenieEditorClass: public Ui_EFIGenieEditorClass {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_EFIGENIEEDITOR_H
